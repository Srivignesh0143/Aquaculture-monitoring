const SensorReading = require('../models/SensorReading')
const DeviceCommand = require('../models/DeviceCommand')
const Device = require('../models/Device')
const { evaluateReading } = require('../services/alertService')
const { markDeviceOnline } = require('../services/deviceService')

// POST /api/iot/sensor-data
// Called by the ESP32 on every sensor cycle. req.device is attached by
// the verifyDevice middleware after checking deviceId + x-device-api-key.
async function receiveSensorData(req, res, next) {
  try {
    const { temperature, ph, dissolvedOxygen, turbidity, timestamp } = req.body
    const device = req.device

    if ([temperature, ph, dissolvedOxygen, turbidity].some((v) => typeof v !== 'number')) {
      return res.status(400).json({ message: 'temperature, ph, dissolvedOxygen and turbidity must all be numbers' })
    }

    const reading = await SensorReading.create({
      deviceId: device.deviceId,
      temperature,
      ph,
      dissolvedOxygen,
      turbidity,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    })

    await markDeviceOnline(device.deviceId)
    await evaluateReading(device, reading)

    res.status(201).json({ message: 'Reading stored', id: reading._id })
  } catch (err) {
    next(err)
  }
}

// POST /api/iot/sensor-data/batch
// Used when the ESP32 reconnects after buffering readings on its SD card
// during a Wi-Fi outage.
async function receiveBatch(req, res, next) {
  try {
    const { readings } = req.body
    const device = req.device

    if (!Array.isArray(readings) || readings.length === 0) {
      return res.status(400).json({ message: 'readings must be a non-empty array' })
    }

    const invalidReading = readings.find(
      (r) =>
        !r ||
        ['temperature', 'ph', 'dissolvedOxygen', 'turbidity'].some(
          (field) => typeof r[field] !== 'number' || !Number.isFinite(r[field])
        )
    )
    if (invalidReading) {
      return res.status(400).json({
        message: 'Each reading must contain finite temperature, ph, dissolvedOxygen and turbidity numbers',
      })
    }

    const docs = readings.map((r) => ({
      deviceId: device.deviceId,
      temperature: r.temperature,
      ph: r.ph,
      dissolvedOxygen: r.dissolvedOxygen,
      turbidity: r.turbidity,
      timestamp: r.timestamp ? new Date(r.timestamp) : new Date(),
    }))

    const inserted = await SensorReading.insertMany(docs)

    // Evaluate only the most recent reading for alerting — evaluating every
    // buffered point individually would flood alerts for a single outage.
    const latest = [...inserted].sort((a, b) => b.timestamp - a.timestamp)[0]
    if (latest) await evaluateReading(device, latest)
    await markDeviceOnline(device.deviceId)
    await Device.updateOne(
      { deviceId: device.deviceId },
      { $set: { pendingRecords: 0, lastSyncAt: new Date() } }
    )

    res.status(201).json({ message: `${inserted.length} readings synced` })
  } catch (err) {
    next(err)
  }
}

// GET /api/iot/device/:deviceId/commands
// Polled by the ESP32 for actuator commands issued from the dashboard.
async function getCommands(req, res, next) {
  try {
    const commands = await DeviceCommand.find({
      deviceId: req.params.deviceId,
      status: 'pending',
    }).sort({ createdAt: 1 })
    res.json(commands)
  } catch (err) {
    next(err)
  }
}

// POST /api/iot/device/status
// The ESP32 reports its own connectivity / sensor health here.
async function updateStatus(req, res, next) {
  try {
    const device = req.device
    const { wifi, sensorsActive, sensorsTotal, sdConnected, freeSpaceBytes, totalSpaceBytes, pendingRecords, lastWriteAt } = req.body

    device.status = 'online'
    device.lastSeen = new Date()
    if (wifi) device.wifi = wifi
    if (typeof sensorsActive === 'number') device.sensorsActive = sensorsActive
    if (typeof sensorsTotal === 'number') device.sensorsTotal = sensorsTotal
    if (typeof sdConnected === 'boolean') device.sdConnected = sdConnected
    if (typeof freeSpaceBytes === 'number') device.freeSpaceBytes = freeSpaceBytes
    if (typeof totalSpaceBytes === 'number') device.totalSpaceBytes = totalSpaceBytes
    if (typeof pendingRecords === 'number') device.pendingRecords = Math.max(0, pendingRecords)
    if (lastWriteAt) device.lastWriteAt = new Date(lastWriteAt)
    await device.save()

    res.json({ message: 'Status updated', device })
  } catch (err) {
    next(err)
  }
}

// POST /api/iot/device/commands/:commandId/ack
// The ESP32 confirms it executed a command (e.g. aerator toggled).
async function acknowledgeCommand(req, res, next) {
  try {
    const command = await DeviceCommand.findByIdAndUpdate(
      req.params.commandId,
      { status: 'executed', executedAt: new Date() },
      { new: true }
    )
    if (!command) return res.status(404).json({ message: 'Command not found' })
    res.json(command)
  } catch (err) {
    next(err)
  }
}

module.exports = { receiveSensorData, receiveBatch, getCommands, updateStatus, acknowledgeCommand }
