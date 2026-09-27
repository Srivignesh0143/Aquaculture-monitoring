const mongoose = require('mongoose')

const feedingScheduleSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true },
    time: { type: String, required: true }, // "HH:mm"
    duration: { type: Number, required: true }, // seconds
    frequency: { type: String, default: 'Daily' },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('FeedingSchedule', feedingScheduleSchema)
