const express = require('express')
const {
  receiveSensorData,
  receiveBatch,
  getCommands,
  updateStatus,
  acknowledgeCommand,
} = require('../controllers/iotController')
const { verifyDevice } = require('../middleware/deviceAuth')

const router = express.Router()

// All ESP32-facing routes are authenticated with deviceId + x-device-api-key
// (see middleware/deviceAuth.js), never with the user JWT.
router.post('/sensor-data', verifyDevice, receiveSensorData)
router.post('/sensor-data/batch', verifyDevice, receiveBatch)
router.get('/device/:deviceId/commands', getCommands)
router.post('/device/status', verifyDevice, updateStatus)
router.post('/device/commands/:commandId/ack', acknowledgeCommand)

module.exports = router
