import api, { USE_MOCK_DATA } from './api.js'
import { mockLogin, mockSignup, mockMe } from './mockData.js'

export const authService = {
  async login(email, password) {
    if (USE_MOCK_DATA) return mockLogin(email, password)
    const res = await api.post('/auth/login', { email, password })
    return res.data
  },

  async signup(payload) {
    if (USE_MOCK_DATA) return mockSignup(payload)
    const res = await api.post('/auth/register', payload)
    return res.data
  },

  async forgotPassword(email) {
    if (USE_MOCK_DATA) return { message: 'Password reset instructions sent (mock mode).' }
    const res = await api.post('/auth/forgot-password', { email })
    return res.data
  },

  async getMe() {
    if (USE_MOCK_DATA) return mockMe()
    const res = await api.get('/auth/me')
    return res.data
  },

  async logout() {
    if (USE_MOCK_DATA) return true
    await api.post('/auth/logout')
    return true
  },
}
