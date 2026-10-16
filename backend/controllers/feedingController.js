const FeedingSchedule = require('../models/FeedingSchedule');
const Device = require('../models/Device');
const DeviceCommand = require('../models/DeviceCommand');

const DEFAULT_DEVICE = 'POND-001';

async function listSchedules(req, res, next) {
  try {
    const schedules = await FeedingSchedule.find({
      deviceId: req.query.deviceId || DEFAULT_DEVICE,
    }).sort({ time: 1 });

    res.json(schedules);
  } catch (err) {
    next(err);
  }
}

async function createSchedule(req, res, next) {
  try {
    const {
      time,
      duration,
      frequency,
      deviceId,
      enabled,
    } = req.body;

    if (!time || duration === undefined) {
      return res.status(400).json({
        message: 'Time and duration are required',
      });
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      return res.status(400).json({
        message: 'Time must be in HH:mm format',
      });
    }

    const seconds = Number(duration);

    if (
      !Number.isInteger(seconds) ||
      seconds < 1 ||
      seconds > 300
    ) {
      return res.status(400).json({
        message: 'Duration must be between 1 and 300 seconds',
      });
    }

    const allowedFrequencies = [
      'Daily',
      'Weekdays',
      'Weekends',
      'Once',
    ];

    const selectedFrequency = frequency || 'Daily';

    if (!allowedFrequencies.includes(selectedFrequency)) {
      return res.status(400).json({
        message: 'Invalid feeding frequency',
      });
    }

    const schedule = await FeedingSchedule.create({
      deviceId: deviceId || DEFAULT_DEVICE,
      time,
      duration: seconds,
      frequency: selectedFrequency,
      enabled: enabled !== false,
    });

    res.status(201).json(schedule);
  } catch (err) {
    next(err);
  }
}

async function updateSchedule(req, res, next) {
  try {
    const updates = {};
    const body = req.body;

    if (body.time !== undefined) {
      if (
        typeof body.time !== 'string' ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.time)
      ) {
        return res.status(400).json({
          message: 'Time must be in HH:mm format',
        });
      }

      updates.time = body.time;
    }

    if (body.duration !== undefined) {
      const seconds = Number(body.duration);

      if (
        !Number.isInteger(seconds) ||
        seconds < 1 ||
        seconds > 300
      ) {
        return res.status(400).json({
          message: 'Duration must be between 1 and 300 seconds',
        });
      }

      updates.duration = seconds;
    }

    if (body.frequency !== undefined) {
      if (
        !['Daily', 'Weekdays', 'Weekends', 'Once'].includes(
          body.frequency
        )
      ) {
        return res.status(400).json({
          message: 'Invalid feeding frequency',
        });
      }

      updates.frequency = body.frequency;
    }

    if (body.enabled !== undefined) {
      updates.enabled = body.enabled === true;
    }

    const schedule = await FeedingSchedule.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!schedule) {
      return res.status(404).json({
        message: 'Schedule not found',
      });
    }

    res.json(schedule);
  } catch (err) {
    next(err);
  }
}

async function deleteSchedule(req, res, next) {
  try {
    const schedule = await FeedingSchedule.findByIdAndDelete(
      req.params.id
    );

    if (!schedule) {
      return res.status(404).json({
        message: 'Schedule not found',
      });
    }

    res.json({
      message: 'Schedule deleted',
    });
  } catch (err) {
    next(err);
  }
}

// Existing manual feeding behavior is preserved.
async function feedNow(req, res, next) {
  try {
    const deviceId = req.body.deviceId || DEFAULT_DEVICE;

    const device = await Device.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({
        message: 'Device is offline',
      });
    }

    // Keep value: true so the existing ESP32 firmware
    // can execute the command without modification.
    const command = await DeviceCommand.create({
      deviceId,
      command: 'feedNow',
      value: true,
      status: 'pending',
    });

    res.status(202).json({
      message:
        'Feed command queued; waiting for ESP32 confirmation',
      commandId: command._id,
      feeder: device.feeder,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  feedNow,
};