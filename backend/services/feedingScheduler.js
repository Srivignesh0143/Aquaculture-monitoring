const FeedingSchedule = require('../models/FeedingSchedule');
const DeviceCommand = require('../models/DeviceCommand');

const DEVICE_ID = 'POND-001';
const TIME_ZONE = 'Asia/Kolkata';
const CHECK_INTERVAL_MS = 15 * 1000;

function getIndiaTime(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  }).formatToParts(date);

  const values = {};

  for (const part of parts) {
    values[part.type] = part.value;
  }

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
    weekday: values.weekday,
  };
}

function frequencyMatches(frequency, weekday) {
  if (frequency === 'Daily') {
    return true;
  }

  if (frequency === 'Weekdays') {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(
      weekday
    );
  }

  if (frequency === 'Weekends') {
    return ['Sat', 'Sun'].includes(weekday);
  }

  if (frequency === 'Once') {
    return true;
  }

  return false;
}

async function processFeedingSchedules(now = new Date()) {
  const clock = getIndiaTime(now);

  const schedules = await FeedingSchedule.find({
    deviceId: DEVICE_ID,
    enabled: true,
    time: clock.time,
  });

  for (const schedule of schedules) {
    if (
      !frequencyMatches(schedule.frequency, clock.weekday)
    ) {
      continue;
    }

    const occurrenceKey =
      `scheduled-feed:${schedule._id}:${clock.date}`;

    try {
      // Reuse the existing command format expected by the ESP32.
      // The existing firmware performs its normal feedNow pulse.
      await DeviceCommand.create({
        deviceId: DEVICE_ID,
        command: 'feedNow',
        value: true,
        status: 'pending',
        occurrenceKey,
      });

      console.log(
        `[FeedingScheduler] Queued schedule ${schedule._id} ` +
        `for ${clock.date} ${clock.time} IST`
      );

      // A Once schedule is disabled after its command is queued.
      if (schedule.frequency === 'Once') {
        schedule.enabled = false;
        await schedule.save();
      }
    } catch (err) {
      // A duplicate means this schedule was already queued today.
      if (err.code === 11000) {
        continue;
      }

      console.error(
        `[FeedingScheduler] Schedule ${schedule._id} failed:`,
        err.message
      );
    }
  }
}

function startFeedingScheduler() {
  console.log(
    `[FeedingScheduler] Started using ${TIME_ZONE}`
  );

  // Run immediately when the backend starts.
  processFeedingSchedules().catch((err) => {
    console.error(
      '[FeedingScheduler] Initial check failed:',
      err.message
    );
  });

  // Then check every 15 seconds.
  setInterval(() => {
    processFeedingSchedules().catch((err) => {
      console.error(
        '[FeedingScheduler] Check failed:',
        err.message
      );
    });
  }, CHECK_INTERVAL_MS);
}

module.exports = {
  startFeedingScheduler,
  processFeedingSchedules,
};