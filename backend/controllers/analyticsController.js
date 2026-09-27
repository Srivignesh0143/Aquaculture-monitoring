const SensorReading = require('../models/SensorReading')
const Device = require('../models/Device')

function statusScore(param, value, t) {
  switch (param) {
    case 'temperature':
      if (value > t.temperature.warnMax) return 0.15
      if (value > t.temperature.max || value < t.temperature.min) return 0.55
      return 1
    case 'ph':
      if (value < t.ph.warnMin || value > t.ph.warnMax) return 0.15
      if (value < t.ph.min || value > t.ph.max) return 0.55
      return 1
    case 'dissolvedOxygen':
      if (value < t.dissolvedOxygen.warnMin) return 0.15
      if (value < t.dissolvedOxygen.min) return 0.55
      return 1
    case 'turbidity':
      if (value > t.turbidity.warnMax) return 0.15
      if (value > t.turbidity.max) return 0.55
      return 1
    default:
      return 1
  }
}

async function getAnalytics(req, res, next) {
  try {
    const deviceId = req.query.deviceId || 'POND-001'
    const device = await Device.findOne({ deviceId })
    const latest = await SensorReading.findOne({ deviceId }).sort({ timestamp: -1 })

    if (!device || !latest) {
      return res.status(404).json({ message: 'Sensor data unavailable' })
    }

    const weights = { temperature: 25, ph: 25, dissolvedOxygen: 30, turbidity: 20 }
    const t = device.thresholds

    const score =
      statusScore('temperature', latest.temperature, t) * weights.temperature +
      statusScore('ph', latest.ph, t) * weights.ph +
      statusScore('dissolvedOxygen', latest.dissolvedOxygen, t) * weights.dissolvedOxygen +
      statusScore('turbidity', latest.turbidity, t) * weights.turbidity

    const healthScore = Math.round(score)
    let healthLabel = 'Critical'
    if (healthScore >= 90) healthLabel = 'Excellent'
    else if (healthScore >= 75) healthLabel = 'Good'
    else if (healthScore >= 50) healthLabel = 'Warning'

    res.json({ healthScore, healthLabel, breakdown: weights, latest })
  } catch (err) {
    next(err)
  }
}

module.exports = { getAnalytics }
