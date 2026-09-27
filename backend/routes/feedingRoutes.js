const express = require('express')
const { listSchedules, createSchedule, updateSchedule, deleteSchedule, feedNow } = require('../controllers/feedingController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/schedules', protect, listSchedules)
router.post('/schedules', protect, createSchedule)
router.put('/schedules/:id', protect, updateSchedule)
router.delete('/schedules/:id', protect, deleteSchedule)
router.post('/feed-now', protect, feedNow)

module.exports = router
