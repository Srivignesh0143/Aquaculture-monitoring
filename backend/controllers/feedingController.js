const FeedingSchedule = require('../models/FeedingSchedule')
const Device = require('../models/Device')
const DeviceCommand = require('../models/DeviceCommand')

const DEFAULT_DEVICE = 'POND-001'

async function listSchedules(req, res, next) {
  try {
    const schedules = await FeedingSchedule.find({ deviceId: req.query.deviceId || DEFAULT_DEVICE }).sort({ time: 1 })
    res.json(schedules)
  } catch (err) {
    next(err)
  }
}

async function createSchedule(req, res, next) {
  try {
    const { time, duration, frequency, deviceId } = req.body
    if (!time || !duration) {
      return res.status(400).json({ message: 'Time and duration are required' })
    }
    const schedule = await FeedingSchedule.create({
      deviceId: deviceId || DEFAULT_DEVICE,
      time,
      duration,
      frequency: frequency || 'Daily',
      enabled: true,
    })
    res.status(201).json(schedule)
  } catch (err) {
    next(err)
  }
}

async function updateSchedule(req, res, next) {
  try {
    const schedule = await FeedingSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' })
    res.json(schedule)
  } catch (err) {
    next(err)
  }
}

async function deleteSchedule(req, res, next) {
  try {
    const schedule = await FeedingSchedule.findByIdAndDelete(req.params.id)
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' })
    res.json({ message: 'Schedule deleted' })
  } catch (err) {
    next(err)
  }
}

async function feedNow(req, res, next) {
  try {
    const deviceId = req.body.deviceId || DEFAULT_DEVICE
    const device = await Device.findOne({ deviceId })
    if (!device) return res.status(404).json({ message: 'Device is offline' })

    await DeviceCommand.create({ deviceId, command: 'feedNow', status: 'pending' })
    device.feeder.status = 'dispensing'
    await device.save()

    res.json({ message: 'Feed command sent', feeder: device.feeder })
  } catch (err) {
    next(err)
  }
}

module.exports = { listSchedules, createSchedule, updateSchedule, deleteSchedule, feedNow }
