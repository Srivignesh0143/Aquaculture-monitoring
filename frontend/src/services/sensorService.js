import api, { USE_MOCK_DATA } from './api.js'
import * as mock from './mockData.js'

export const sensorService = {
  getLatest: () => (USE_MOCK_DATA ? mock.getLatestReading() : api.get('/sensors/latest').then((r) => r.data)),

  getHistory: (range) =>
    USE_MOCK_DATA ? mock.getHistory(range) : api.get('/sensors/history', { params: { range } }).then((r) => r.data),

  getDevice: () => (USE_MOCK_DATA ? mock.getDevice() : api.get('/devices/POND-001').then((r) => r.data)),

  getSyncStatus: () =>
    USE_MOCK_DATA ? mock.getDevice() : api.get('/devices/POND-001/status').then((r) => r.data),

  sendCommand: (command, value) =>
    USE_MOCK_DATA
      ? mock.sendDeviceCommand(command, value)
      : api.post('/devices/POND-001/commands', { command, value }).then((r) => r.data),

  feedNow: () => (USE_MOCK_DATA ? mock.feedNow() : api.post('/feeding/feed-now').then((r) => r.data)),

  getSchedules: () => (USE_MOCK_DATA ? mock.getSchedules() : api.get('/feeding/schedules').then((r) => r.data)),

  addSchedule: (payload) =>
    USE_MOCK_DATA ? mock.addSchedule(payload) : api.post('/feeding/schedules', payload).then((r) => r.data),

  updateSchedule: (id, payload) =>
    USE_MOCK_DATA
      ? mock.updateSchedule(id, payload)
      : api.put(`/feeding/schedules/${id}`, payload).then((r) => r.data),

  deleteSchedule: (id) =>
    USE_MOCK_DATA ? mock.deleteSchedule(id) : api.delete(`/feeding/schedules/${id}`).then((r) => r.data),

  getAlerts: () => (USE_MOCK_DATA ? mock.getAlerts() : api.get('/alerts').then((r) => r.data)),

  markAlertRead: (id) => (USE_MOCK_DATA ? mock.markAlertRead(id) : api.put(`/alerts/${id}/read`).then((r) => r.data)),

  deleteAlert: (id) => (USE_MOCK_DATA ? mock.deleteAlert(id) : api.delete(`/alerts/${id}`).then((r) => r.data)),

  getThresholds: () => (USE_MOCK_DATA ? mock.getThresholds() : api.get('/settings/thresholds').then((r) => r.data)),

  updateThresholds: (payload) =>
    USE_MOCK_DATA
      ? mock.updateThresholds(payload)
      : api.put('/settings/thresholds', payload).then((r) => r.data),

  getNotificationSettings: () =>
    USE_MOCK_DATA ? mock.getNotificationSettings() : api.get('/settings/notifications').then((r) => r.data),

  updateNotificationSettings: (payload) =>
    USE_MOCK_DATA
      ? mock.updateNotificationSettings(payload)
      : api.put('/settings/notifications', payload).then((r) => r.data),

  updateProfile: (payload) =>
    USE_MOCK_DATA ? mock.updateProfile(payload) : api.put('/auth/me', payload).then((r) => r.data),

  getAnalytics: () => (USE_MOCK_DATA ? mock.getAnalytics() : api.get('/analytics').then((r) => r.data)),

  statusFor: (param, value) => mock.statusFor(param, value),
}
