const express = require('express')
const { getLatest, getHistory } = require('../controllers/sensorController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/latest', protect, getLatest)
router.get('/history', protect, getHistory)

module.exports = router
