const mongoose = require('mongoose')

const alertSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true },
    type: { type: String, required: true }, // LOW_DO | HIGH_TEMPERATURE | ABNORMAL_PH | HIGH_TURBIDITY | DEVICE_OFFLINE
    severity: { type: String, enum: ['INFO', 'WARNING', 'CRITICAL'], required: true },
    message: { type: String, required: true },
    value: { type: Number },
    threshold: { type: Number },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
)

alertSchema.index({ deviceId: 1, type: 1, createdAt: -1 })

module.exports = mongoose.model('Alert', alertSchema)
