// One-time setup script: creates the initial Device document with a
// hashed API key. Run with: node seed.js
//
// The RAW api key is printed once to the console — copy it into your
// ESP32 firmware's config (it is never stored in plain text, and never
// exposed to the frontend).
require('dotenv').config()
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const connectDB = require('./config/db')
const Device = require('./models/Device')

async function seed() {
  await connectDB()

  const deviceId = process.argv[2] || 'POND-001'
  const existing = await Device.findOne({ deviceId })
  if (existing) {
    console.log(`Device ${deviceId} already exists. Delete it first if you want to re-seed.`)
    process.exit(0)
  }

  const rawApiKey = crypto.randomBytes(24).toString('hex')
  const apiKeyHash = await bcrypt.hash(rawApiKey, 12)

  await Device.create({
    deviceId,
    name: 'Main Grow-Out Pond',
    location: 'Pond A',
    apiKeyHash,
    status: 'offline',
  })

  console.log('Device created successfully.')
  console.log(`  deviceId: ${deviceId}`)
  console.log(`  deviceApiKey (save this — it will not be shown again): ${rawApiKey}`)
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
