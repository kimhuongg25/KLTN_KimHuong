const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Chỉ Admin mới được xem thống kê
router.get('/', protect, dashboardController.getDashboardStats);

module.exports = router;