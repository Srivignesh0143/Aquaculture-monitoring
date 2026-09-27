require('dotenv').config()
const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/db')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')
const { checkOfflineDevices } = require('./services/deviceService')

const authRoutes = require('./routes/authRoutes')
const sensorRoutes = require('./routes/sensorRoutes')
const deviceRoutes = require('./routes/deviceRoutes')
const feedingRoutes = require('./routes/feedingRoutes')
const alertRoutes = require('./routes/alertRoutes')
const analyticsRoutes = require('./routes/analyticsRoutes')
const settingsRoutes = require('./routes/settingsRoutes')
const iotRoutes = require('./routes/iotRoutes')

const app = express()

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }))
app.use(express.json())

// General API rate limiting. IoT ingest is intentionally allowed a higher
// ceiling since a device may report every few seconds.
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 })
const iotLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 })
app.use('/api/auth', apiLimiter)
app.use('/api/iot', iotLimiter)

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

app.use('/api/auth', authRoutes)
app.use('/api/sensors', sensorRoutes)
app.use('/api/devices', deviceRoutes)
app.use('/api/feeding', feedingRoutes)
app.use('/api/alerts', alertRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/iot', iotRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

  // Periodically mark devices offline if they've gone quiet, and raise
  // DEVICE_OFFLINE alerts (see services/deviceService.js).
  setInterval(() => {
    checkOfflineDevices().catch((err) => console.error('Offline check failed:', err.message))
  }, 60 * 1000)
})
