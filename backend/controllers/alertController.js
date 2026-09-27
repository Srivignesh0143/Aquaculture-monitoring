const Alert = require('../models/Alert')

async function listAlerts(req, res, next) {
  try {
    const filter = { deviceId: req.query.deviceId || 'POND-001' }
    if (req.query.severity && req.query.severity !== 'ALL') filter.severity = req.query.severity
    if (req.query.date) {
      const start = new Date(req.query.date)
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
      filter.createdAt = { $gte: start, $lt: end }
    }
    const alerts = await Alert.find(filter).sort({ createdAt: -1 })
    res.json(alerts)
  } catch (err) {
    next(err)
  }
}

async function markRead(req, res, next) {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { read: true }, { new: true })
    if (!alert) return res.status(404).json({ message: 'Alert not found' })
    res.json(alert)
  } catch (err) {
    next(err)
  }
}

async function deleteAlert(req, res, next) {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id)
    if (!alert) return res.status(404).json({ message: 'Alert not found' })
    res.json({ message: 'Alert deleted' })
  } catch (err) {
    next(err)
  }
}

module.exports = { listAlerts, markRead, deleteAlert }
