const SensorReading = require('../models/SensorReading')

const RANGE_MS = {
  '1h': 1000 * 60 * 60,
  '24h': 1000 * 60 * 60 * 24,
  '7d': 1000 * 60 * 60 * 24 * 7,
  '30d': 1000 * 60 * 60 * 24 * 30,
}

async function getLatest(req, res, next) {
  try {
    const deviceId = req.query.deviceId || 'POND-001'
    const reading = await SensorReading.findOne({ deviceId }).sort({ timestamp: -1 })
    if (!reading) return res.status(404).json({ message: 'Sensor data unavailable' })
    res.json(reading)
  } catch (err) {
    next(err)
  }
}

async function getHistory(req, res, next) {
  try {
    const deviceId = req.query.deviceId || 'POND-001'
    const range = req.query.range || '24h'

    const query = { deviceId }
    if (req.query.start && req.query.end) {
      query.timestamp = { $gte: new Date(req.query.start), $lte: new Date(req.query.end) }
    } else {
      const ms = RANGE_MS[range] || RANGE_MS['24h']
      query.timestamp = { $gte: new Date(Date.now() - ms) }
    }

    const readings = await SensorReading.find(query).sort({ timestamp: 1 }).limit(5000)
    res.json(readings)
  } catch (err) {
    next(err)
  }
}

module.exports = { getLatest, getHistory }
