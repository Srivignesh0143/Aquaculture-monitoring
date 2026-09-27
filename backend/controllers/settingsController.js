const Device = require('../models/Device')

const DEFAULT_DEVICE = 'POND-001'

async function getThresholds(req, res, next) {
  try {
    const device = await Device.findOne({ deviceId: req.query.deviceId || DEFAULT_DEVICE })
    if (!device) return res.status(404).json({ message: 'Device not found' })
    res.json(device.thresholds)
  } catch (err) {
    next(err)
  }
}

async function updateThresholds(req, res, next) {
  try {
    const device = await Device.findOne({ deviceId: req.body.deviceId || DEFAULT_DEVICE })
    if (!device) return res.status(404).json({ message: 'Device not found' })
    device.thresholds = { ...device.thresholds.toObject(), ...req.body }
    await device.save()
    res.json(device.thresholds)
  } catch (err) {
    next(err)
  }
}

async function getNotificationSettings(req, res, next) {
  try {
    const device = await Device.findOne({ deviceId: req.query.deviceId || DEFAULT_DEVICE })
    if (!device) return res.status(404).json({ message: 'Device not found' })
    res.json(device.notificationSettings)
  } catch (err) {
    next(err)
  }
}

async function updateNotificationSettings(req, res, next) {
  try {
    const device = await Device.findOne({ deviceId: req.body.deviceId || DEFAULT_DEVICE })
    if (!device) return res.status(404).json({ message: 'Device not found' })
    device.notificationSettings = { ...device.notificationSettings.toObject(), ...req.body }
    await device.save()
    res.json(device.notificationSettings)
  } catch (err) {
    next(err)
  }
}

module.exports = { getThresholds, updateThresholds, getNotificationSettings, updateNotificationSettings }
