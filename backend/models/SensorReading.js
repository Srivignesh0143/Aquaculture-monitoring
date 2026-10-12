const mongoose = require('mongoose')

const sensorReadingSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, index: true },
  temperature: { type: Number, required: true },
  ph: { type: Number, required: true },
  waterLevel: { type: Number, required: true },
  turbidity: { type: Number, required: true },
  timestamp: { type: Date, required: true, default: Date.now, index: true },
})

sensorReadingSchema.index({ deviceId: 1, timestamp: -1 })

module.exports = mongoose.model('SensorReading', sensorReadingSchema)
