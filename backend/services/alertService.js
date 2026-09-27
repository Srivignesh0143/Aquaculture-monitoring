const Alert = require('../models/Alert')

// Cooldown window: don't create a duplicate alert of the same type for the
// same device within this many minutes, so a sensor hovering near a
// threshold doesn't spam a new alert on every reading.
const COOLDOWN_MINUTES = 15

async function createAlertIfNeeded({ deviceId, type, severity, message, value, threshold }) {
  const cooldownStart = new Date(Date.now() - COOLDOWN_MINUTES * 60 * 1000)

  const recent = await Alert.findOne({
    deviceId,
    type,
    createdAt: { $gte: cooldownStart },
  })

  if (recent) return null // still within cooldown, skip duplicate

  return Alert.create({ deviceId, type, severity, message, value, threshold })
}

// Evaluates a single sensor reading against the device's configured
// thresholds and raises alerts as needed. Called after every sensor-data
// ingest from the ESP32.
async function evaluateReading(device, reading) {
  const t = device.thresholds
  const created = []

  if (reading.dissolvedOxygen < t.dissolvedOxygen.warnMin) {
    const alert = await createAlertIfNeeded({
      deviceId: device.deviceId,
      type: 'LOW_DO',
      severity: 'CRITICAL',
      message: `DO dropped below ${t.dissolvedOxygen.warnMin} mg/L.`,
      value: reading.dissolvedOxygen,
      threshold: t.dissolvedOxygen.warnMin,
    })
    if (alert) created.push(alert)
  }

  if (reading.temperature > t.temperature.warnMax) {
    const alert = await createAlertIfNeeded({
      deviceId: device.deviceId,
      type: 'HIGH_TEMPERATURE',
      severity: 'WARNING',
      message: `Temperature exceeded ${t.temperature.warnMax}°C.`,
      value: reading.temperature,
      threshold: t.temperature.warnMax,
    })
    if (alert) created.push(alert)
  }

  if (reading.turbidity > t.turbidity.warnMax) {
    const alert = await createAlertIfNeeded({
      deviceId: device.deviceId,
      type: 'HIGH_TURBIDITY',
      severity: 'WARNING',
      message: `Turbidity exceeded safe level of ${t.turbidity.warnMax} NTU.`,
      value: reading.turbidity,
      threshold: t.turbidity.warnMax,
    })
    if (alert) created.push(alert)
  }

  if (reading.ph < t.ph.warnMin || reading.ph > t.ph.warnMax) {
    const alert = await createAlertIfNeeded({
      deviceId: device.deviceId,
      type: 'ABNORMAL_PH',
      severity: 'CRITICAL',
      message: 'pH is outside the configured range.',
      value: reading.ph,
      threshold: reading.ph < t.ph.warnMin ? t.ph.warnMin : t.ph.warnMax,
    })
    if (alert) created.push(alert)
  }

  return created
}

async function createOfflineAlert(deviceId) {
  return createAlertIfNeeded({
    deviceId,
    type: 'DEVICE_OFFLINE',
    severity: 'CRITICAL',
    message: 'ESP32 has not sent data for 5 minutes.',
    value: null,
    threshold: null,
  })
}

module.exports = { evaluateReading, createOfflineAlert }
