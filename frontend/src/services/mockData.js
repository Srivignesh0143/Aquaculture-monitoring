// Mock data layer used when VITE_USE_MOCK_DATA=true.
// Mirrors the shape of the real backend responses so pages don't need
// to branch on mock vs. real data — only the services/*.js files do.

const DEVICE_ID = 'POND-001'
const STORAGE_KEY = 'aq_mock_state_v1'

const defaultThresholds = {
  temperature: { min: 24, max: 30, warnMax: 32 },
  ph: { min: 6.5, max: 8.5, warnMin: 6.0, warnMax: 9.0 },
  waterLevel: { min: 5, warnMin: 3 },
  turbidity: { max: 5, warnMax: 10 },
}

const defaultNotificationSettings = {
  lowWaterLevel: true,
  highTemperature: true,
  ph: true,
  turbidity: true,
  deviceOffline: true,
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const state = JSON.parse(raw)
      state.history = state.history?.map((reading) => {
        if (reading.waterLevel === undefined && reading.dissolvedOxygen !== undefined) {
          const { dissolvedOxygen, ...rest } = reading
          return { ...rest, waterLevel: dissolvedOxygen }
        }
        return reading
      })
      if (state.thresholds?.waterLevel === undefined && state.thresholds?.dissolvedOxygen !== undefined) {
        state.thresholds.waterLevel = state.thresholds.dissolvedOxygen
        delete state.thresholds.dissolvedOxygen
      }
      if (state.notificationSettings?.lowWaterLevel === undefined && state.notificationSettings?.lowDO !== undefined) {
        state.notificationSettings.lowWaterLevel = state.notificationSettings.lowDO
        delete state.notificationSettings.lowDO
      }
      if (!Array.isArray(state.history)) state.history = []
      saveState(state)
      return state
    }
  } catch (e) {
    /* ignore corrupt state */
  }
  return null
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function randomWalk(value, step, min, max) {
  let next = value + (Math.random() - 0.5) * step
  next = Math.max(min, Math.min(max, next))
  return Math.round(next * 100) / 100
}

function genHistory(hours, intervalMinutes, base) {
  const points = []
  const now = Date.now()
  const count = Math.floor((hours * 60) / intervalMinutes)
  let temperature = base.temperature
  let ph = base.ph
  let waterLevel = base.waterLevel
  let turbidity = base.turbidity
  for (let i = count; i >= 0; i--) {
    temperature = randomWalk(temperature, 0.4, 22, 33)
    ph = randomWalk(ph, 0.08, 5.8, 9.2)
    waterLevel = randomWalk(waterLevel, 0.25, 2, 9)
    turbidity = randomWalk(turbidity, 0.3, 0.5, 12)
    points.push({
      timestamp: new Date(now - i * intervalMinutes * 60 * 1000).toISOString(),
      temperature,
      ph,
      waterLevel,
      turbidity,
    })
  }
  return points
}

function seedState() {
  const history = genHistory(24 * 7, 15, {
    temperature: 28.4,
    ph: 7.4,
    waterLevel: 6.8,
    turbidity: 3.2,
  })

  const state = {
    user: {
      id: 'u_demo_1',
      name: 'Alex Rivera',
      email: 'demo@aquaculture.io',
      phone: '+1 555-0134',
      role: 'Farmer / Operator',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    },
    device: {
      deviceId: DEVICE_ID,
      name: 'Main Grow-Out Pond',
      location: 'Pond A - North Field',
      status: 'online',
      lastSeen: new Date().toISOString(),
      wifi: 'Connected',
      sensorsActive: 4,
      sensorsTotal: 4,
      sdConnected: true,
      freeSpaceBytes: 2.2 * 1024 * 1024 * 1024,
      totalSpaceBytes: 4 * 1024 * 1024 * 1024,
      pendingRecords: 0,
      syncedRecords: history.length,
      lastSyncAt: new Date().toISOString(),
      lastWriteAt: new Date().toISOString(),
      controlMode: 'automatic', // 'manual' | 'automatic'
      aerator: 'off',
      aeratorSchedule: { time: '06:00', duration: 30, enabled: true },
      feeder: {
        status: 'ready',
        lastFeeding: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      },
      rtc: new Date().toISOString(),
    },
    history,
    thresholds: defaultThresholds,
    notificationSettings: defaultNotificationSettings,
    schedules: [
      { id: 's1', time: '06:30', duration: 10, frequency: 'Daily', enabled: true },
      { id: 's2', time: '12:30', duration: 10, frequency: 'Daily', enabled: true },
      { id: 's3', time: '18:30', duration: 15, frequency: 'Daily', enabled: true },
    ],
    alerts: [
      {
        id: 'a1',
        type: 'LOW_WATER_LEVEL',
        severity: 'CRITICAL',
        message: 'Water level dropped below 3 cm.',
        value: 2.7,
        threshold: 3.0,
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      },
      {
        id: 'a2',
        type: 'HIGH_TEMPERATURE',
        severity: 'WARNING',
        message: 'Temperature exceeded 32°C.',
        value: 32.4,
        threshold: 32,
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: 'a3',
        type: 'DEVICE_OFFLINE',
        severity: 'CRITICAL',
        message: 'ESP32 has not sent data for 5 minutes.',
        value: null,
        threshold: null,
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ],
    commands: [],
  }
  saveState(state)
  return state
}

function getState() {
  return loadState() || seedState()
}

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---- Auth ----
export async function mockLogin(email, password) {
  await delay()
  if (!email || !password) throw new Error('Invalid login credentials')
  const state = getState()
  state.user.email = email
  saveState(state)
  return { token: 'mock-jwt-token', user: state.user }
}

export async function mockSignup(payload) {
  await delay()
  const state = getState()
  state.user = {
    id: 'u_demo_1',
    name: payload.fullName,
    email: payload.email,
    phone: payload.phoneNumber,
    role: 'Farmer / Operator',
    createdAt: new Date().toISOString(),
  }
  saveState(state)
  return { token: 'mock-jwt-token', user: state.user }
}

export async function mockMe() {
  await delay(150)
  const state = getState()
  return state.user
}

// ---- Sensors ----
export function statusFor(param, value) {
  const t = getState().thresholds[param]
  if (value === null || value === undefined) return 'unknown'
  switch (param) {
    case 'temperature':
      if (value > t.warnMax) return 'critical'
      if (value > t.max || value < t.min) return 'warning'
      return 'good'
    case 'ph':
      if (value < t.warnMin || value > t.warnMax) return 'critical'
      if (value < t.min || value > t.max) return 'warning'
      return 'good'
    case 'waterLevel':
      if (value < t.warnMin) return 'critical'
      if (value < t.min) return 'warning'
      return 'good'
    case 'turbidity':
      if (value > t.warnMax) return 'critical'
      if (value > t.max) return 'warning'
      return 'good'
    default:
      return 'unknown'
  }
}

export async function getLatestReading() {
  await delay(200)
  const state = getState()
  const last = state.history[state.history.length - 1]
  const next = {
    timestamp: new Date().toISOString(),
    temperature: randomWalk(last.temperature, 0.3, 22, 33),
    ph: randomWalk(last.ph, 0.05, 5.8, 9.2),
    waterLevel: randomWalk(last.waterLevel, 0.2, 2, 9),
    turbidity: randomWalk(last.turbidity, 0.25, 0.5, 12),
  }
  state.history.push(next)
  if (state.history.length > 3000) state.history.shift()
  state.device.lastSeen = new Date().toISOString()
  saveState(state)
  return next
}

export async function getHistory(range = '24h') {
  await delay(300)
  const state = getState()
  const now = Date.now()
  const rangeMs = {
    '1h': 1000 * 60 * 60,
    '24h': 1000 * 60 * 60 * 24,
    '7d': 1000 * 60 * 60 * 24 * 7,
    '30d': 1000 * 60 * 60 * 24 * 30,
  }[range] || 1000 * 60 * 60 * 24
  return (Array.isArray(state.history) ? state.history : []).filter((p) => now - new Date(p.timestamp).getTime() <= rangeMs)
}

// ---- Device / Actuators ----
export async function getDevice() {
  await delay(200)
  return getState().device
}

export async function sendDeviceCommand(command, value) {
  await delay(500)
  const state = getState()
  if (command === 'aerator') state.device.aerator = value
  if (command === 'controlMode') state.device.controlMode = value
  if (command === 'aeratorSchedule') state.device.aeratorSchedule = value
  if (command === 'syncTime') state.device.rtc = new Date().toISOString()
  state.commands.unshift({
    id: 'c' + Date.now(),
    command,
    value,
    status: 'executed',
    createdAt: new Date().toISOString(),
    executedAt: new Date().toISOString(),
  })
  saveState(state)
  return state.device
}

export async function feedNow() {
  await delay(700)
  const state = getState()
  state.device.feeder.lastFeeding = new Date().toISOString()
  state.device.feeder.status = 'ready'
  saveState(state)
  return state.device.feeder
}

// ---- Feeding schedules ----
export async function getSchedules() {
  await delay(200)
  return getState().schedules
}

export async function addSchedule(schedule) {
  await delay(300)
  const state = getState()
  const newSchedule = { id: 's' + Date.now(), enabled: true, ...schedule }
  state.schedules.push(newSchedule)
  saveState(state)
  return newSchedule
}

export async function updateSchedule(id, updates) {
  await delay(300)
  const state = getState()
  state.schedules = state.schedules.map((s) => (s.id === id ? { ...s, ...updates } : s))
  saveState(state)
  return state.schedules.find((s) => s.id === id)
}

export async function deleteSchedule(id) {
  await delay(250)
  const state = getState()
  state.schedules = state.schedules.filter((s) => s.id !== id)
  saveState(state)
  return true
}

// ---- Alerts ----
export async function getAlerts() {
  await delay(250)
  return getState().alerts
}

export async function markAlertRead(id) {
  await delay(150)
  const state = getState()
  state.alerts = state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a))
  saveState(state)
  return true
}

export async function deleteAlert(id) {
  await delay(150)
  const state = getState()
  state.alerts = state.alerts.filter((a) => a.id !== id)
  saveState(state)
  return true
}

// ---- Settings ----
export async function getThresholds() {
  await delay(150)
  return getState().thresholds
}

export async function updateThresholds(thresholds) {
  await delay(300)
  const state = getState()
  state.thresholds = { ...state.thresholds, ...thresholds }
  saveState(state)
  return state.thresholds
}

export async function getNotificationSettings() {
  await delay(150)
  return getState().notificationSettings
}

export async function updateNotificationSettings(settings) {
  await delay(250)
  const state = getState()
  state.notificationSettings = { ...state.notificationSettings, ...settings }
  saveState(state)
  return state.notificationSettings
}

export async function updateProfile(updates) {
  await delay(300)
  const state = getState()
  state.user = { ...state.user, ...updates }
  saveState(state)
  return state.user
}

// ---- Analytics ----
export async function getAnalytics() {
  await delay(300)
  const state = getState()
  const last = state.history[state.history.length - 1]
  const weights = { temperature: 25, ph: 25, waterLevel: 30, turbidity: 20 }
  const scoreFor = (param, value) => {
    const s = statusFor(param, value)
    if (s === 'good') return 1
    if (s === 'warning') return 0.55
    return 0.15
  }
  const score =
    scoreFor('temperature', last.temperature) * weights.temperature +
    scoreFor('ph', last.ph) * weights.ph +
    scoreFor('waterLevel', last.waterLevel) * weights.waterLevel +
    scoreFor('turbidity', last.turbidity) * weights.turbidity
  const healthScore = Math.round(score)
  let healthLabel = 'Critical'
  if (healthScore >= 90) healthLabel = 'Excellent'
  else if (healthScore >= 75) healthLabel = 'Good'
  else if (healthScore >= 50) healthLabel = 'Warning'
  return { healthScore, healthLabel, breakdown: weights, latest: last }
}
