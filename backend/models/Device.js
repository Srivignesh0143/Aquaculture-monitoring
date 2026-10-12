const mongoose = require('mongoose')

const deviceSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, unique: true },
    name: { type: String, default: 'Pond Device' },
    location: { type: String, default: '' },
    apiKeyHash: { type: String, required: true, select: false },
    status: { type: String, enum: ['online', 'offline'], default: 'offline' },
    lastSeen: { type: Date },
    wifi: { type: String, default: 'Disconnected' },
    sensorsActive: { type: Number, default: 0 },
    sensorsTotal: { type: Number, default: 4 },
    sdConnected: { type: Boolean, default: false },
    freeSpaceBytes: { type: Number, default: 0 },
    totalSpaceBytes: { type: Number, default: 0 },
    pendingRecords: { type: Number, default: 0 },
    lastSyncAt: { type: Date },
    lastWriteAt: { type: Date },
    controlMode: { type: String, enum: ['manual', 'automatic'], default: 'automatic' },
    aerator: { type: String, enum: ['on', 'off'], default: 'off' },
    aeratorSchedule: {
      time: { type: String, default: '06:00' },
      duration: { type: Number, default: 30 },
      enabled: { type: Boolean, default: true },
    },
    feeder: {
      status: { type: String, default: 'ready' },
      lastFeeding: { type: Date },
    },
    thresholds: {
      temperature: { min: { type: Number, default: 24 }, max: { type: Number, default: 30 }, warnMax: { type: Number, default: 32 } },
      ph: { min: { type: Number, default: 6.5 }, max: { type: Number, default: 8.5 }, warnMin: { type: Number, default: 6.0 }, warnMax: { type: Number, default: 9.0 } },
      waterLevel: { min: { type: Number, default: 5 }, warnMin: { type: Number, default: 3 } },
      turbidity: { max: { type: Number, default: 5 }, warnMax: { type: Number, default: 10 } },
    },
    notificationSettings: {
      lowWaterLevel: { type: Boolean, default: true },
      highTemperature: { type: Boolean, default: true },
      ph: { type: Boolean, default: true },
      turbidity: { type: Boolean, default: true },
      deviceOffline: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Device', deviceSchema)
