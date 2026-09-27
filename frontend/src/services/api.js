import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aq_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('aq_token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    const message =
      err.response?.data?.message ||
      (err.request && !err.response ? 'Unable to connect to server' : 'Something went wrong')
    return Promise.reject(new Error(message))
  }
)

export const USE_MOCK_DATA = String(import.meta.env.VITE_USE_MOCK_DATA) === 'true'

export default api
