
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
require('dotenv').config()

const Device = require('./models/Device')

async function updateDeviceKey() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from your backend .env file')
    }

    await mongoose.connect(process.env.MONGO_URI)

    const deviceId = 'POND-001'

    // Find the existing device. Do not create a duplicate.
    const device = await Device.findOne({ deviceId }).select('+apiKeyHash')

    if (!device) {
      throw new Error(`Device ${deviceId} was not found`)
    }

    // Generate a new, random secret for this device.
    const rawApiKey = crypto.randomBytes(32).toString('hex')
    const apiKeyHash = await bcrypt.hash(rawApiKey, 12)

    // Replace only this device's API key hash.
    device.apiKeyHash = apiKeyHash
    await device.save()

    console.log('\nDevice API key updated successfully.')
    console.log('DEVICE_ID:', deviceId)
    console.log('DEVICE_API_KEY:', rawApiKey)
    console.log('\nCopy the key securely. It cannot be recovered from the hash.')
    console.log('Do not share it or commit it to GitHub.')
  } catch (error) {
    console.error('Failed:', error.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

updateDeviceKey()
