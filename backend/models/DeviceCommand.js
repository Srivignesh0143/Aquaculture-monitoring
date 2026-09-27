const mongoose = require('mongoose')

const deviceCommandSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true },
    command: { type: String, required: true }, // 'aerator' | 'feedNow' | 'controlMode' | 'syncTime'
    value: { type: mongoose.Schema.Types.Mixed },
    status: { type: String, enum: ['pending', 'executed', 'failed'], default: 'pending' },
    executedAt: { type: Date },
  },
  { timestamps: true }
)

module.exports = mongoose.model('DeviceCommand', deviceCommandSchema)
