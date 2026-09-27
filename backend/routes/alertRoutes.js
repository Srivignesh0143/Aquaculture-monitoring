const express = require('express')
const { listAlerts, markRead, deleteAlert } = require('../controllers/alertController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', protect, listAlerts)
router.put('/:id/read', protect, markRead)
router.delete('/:id', protect, deleteAlert)

module.exports = router
