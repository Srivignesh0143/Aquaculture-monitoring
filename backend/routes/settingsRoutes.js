const express = require('express')
const {
  getThresholds,
  updateThresholds,
  getNotificationSettings,
  updateNotificationSettings,
} = require('../controllers/settingsController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/thresholds', protect, getThresholds)
router.put('/thresholds', protect, updateThresholds)
router.get('/notifications', protect, getNotificationSettings)
router.put('/notifications', protect, updateNotificationSettings)

module.exports = router
