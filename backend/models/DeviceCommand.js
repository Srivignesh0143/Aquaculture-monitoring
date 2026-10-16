const mongoose = require('mongoose');

const deviceCommandSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      index: true,
    },

    command: {
      type: String,
      required: true,
    },

    value: {
      type: mongoose.Schema.Types.Mixed,
    },

    status: {
      type: String,
      enum: ['pending', 'executed', 'failed'],
      default: 'pending',
    },

    executedAt: {
      type: Date,
    },

    // Identifies one scheduled occurrence and prevents duplicates.
    // Manual commands leave this field unset.
    occurrenceKey: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'DeviceCommand',
  deviceCommandSchema
);