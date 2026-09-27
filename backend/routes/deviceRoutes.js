const express = require('express')
const { listDevices, getDevice, createCommand, getPendingCommands, getDeviceStatus } = require('../controllers/deviceController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', protect, listDevices)
router.get('/:id', protect, getDevice)
router.get('/:id/status', protect, getDeviceStatus)
router.post('/:id/commands', protect, createCommand)
router.get('/:id/commands', protect, getPendingCommands)

module.exports = router
