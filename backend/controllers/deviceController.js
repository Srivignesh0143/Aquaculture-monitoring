const Device = require('../models/Device')
const DeviceCommand = require('../models/DeviceCommand')
const SensorReading = require('../models/SensorReading')

async function listDevices(req, res, next) {
  try {
    const devices = await Device.find()
    res.json(devices)
  } catch (err) {
    next(err)
  }
}

async function getDevice(req, res, next) {
  try {
    const device = await Device.findOne({ deviceId: req.params.id })
    if (!device) return res.status(404).json({ message: 'Device not found' })
    res.json(device)
  } catch (err) {
    next(err)
  }
}

async function createCommand(req, res, next) {
  try {
    const { command, value } = req.body
    const device = await Device.findOne({ deviceId: req.params.id })
    if (!device) return res.status(404).json({ message: 'Device is offline' })

    if (command === 'aerator') device.aerator = value
    if (command === 'controlMode') device.controlMode = value
    await device.save()

    const savedCommand = await DeviceCommand.create({
      deviceId: req.params.id,
      command,
      value,
      status: 'pending',
    })

    res.status(201).json({ command: savedCommand, device })
  } catch (err) {
    next(err)
  }
}

// Polled by the ESP32 to retrieve any pending commands.
async function getPendingCommands(req, res, next) {
  try {
    const commands = await DeviceCommand.find({ deviceId: req.params.id, status: 'pending' }).sort({ createdAt: 1 })
    res.json(commands)
  } catch (err) {
    next(err)
  }
}

async function getDeviceStatus(req, res, next) {
  try {
    const device = await Device.findOne({ deviceId: req.params.id })
    if (!device) return res.status(404).json({ message: 'Device not found' })
    const syncedRecords = await SensorReading.countDocuments({ deviceId: device.deviceId })
    res.json({
      deviceId: device.deviceId,
      status: device.status,
      lastSeen: device.lastSeen,
      wifi: device.wifi,
      sensorsActive: device.sensorsActive,
      sensorsTotal: device.sensorsTotal,
      sdConnected: device.sdConnected,
      freeSpaceBytes: device.freeSpaceBytes,
      totalSpaceBytes: device.totalSpaceBytes,
      pendingRecords: device.pendingRecords,
      syncedRecords,
      lastSyncAt: device.lastSyncAt,
      lastWriteAt: device.lastWriteAt,
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { listDevices, getDevice, createCommand, getPendingCommands, getDeviceStatus }
