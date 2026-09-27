const bcrypt = require('bcryptjs')
const Device = require('../models/Device')

// Verifies the deviceId + deviceApiKey pair sent by the ESP32.
// The device is looked up by deviceId, then the raw API key from the
// request is compared against the stored bcrypt hash.
async function verifyDevice(req, res, next) {
  try {
    const deviceId = req.body.deviceId || req.params.deviceId
    const apiKey = req.headers['x-device-api-key']

    if (!deviceId || !apiKey) {
      return res.status(401).json({ message: 'Device authentication failed: missing credentials' })
    }

    const device = await Device.findOne({ deviceId }).select('+apiKeyHash')
    if (!device) {
      return res.status(401).json({ message: 'Device authentication failed: unknown device' })
    }

    const valid = await bcrypt.compare(apiKey, device.apiKeyHash)
    if (!valid) {
      return res.status(401).json({ message: 'Device authentication failed: invalid API key' })
    }

    req.device = device
    next()
  } catch (err) {
    return res.status(500).json({ message: 'Device authentication error' })
  }
}

module.exports = { verifyDevice }
