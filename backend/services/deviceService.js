const Device = require('../models/Device')
const { createOfflineAlert } = require('./alertService')

// Marks devices offline if they haven't sent data within the configured
// window, and raises a DEVICE_OFFLINE alert (subject to cooldown).
// Intended to be run on an interval (see server.js).
async function checkOfflineDevices() {
  const minutes = Number(process.env.ALERT_OFFLINE_MINUTES || 5)
  const cutoff = new Date(Date.now() - minutes * 60 * 1000)

  const staleDevices = await Device.find({
    status: 'online',
    lastSeen: { $lt: cutoff },
  })

  for (const device of staleDevices) {
    device.status = 'offline'
    await device.save()
    if (device.notificationSettings?.deviceOffline !== false) {
      await createOfflineAlert(device.deviceId)
    }
  }

  return staleDevices.length
}

async function markDeviceOnline(deviceId) {
  return Device.findOneAndUpdate(
    { deviceId },
    { status: 'online', lastSeen: new Date() },
    { new: true }
  )
}

module.exports = { checkOfflineDevices, markDeviceOnline }
