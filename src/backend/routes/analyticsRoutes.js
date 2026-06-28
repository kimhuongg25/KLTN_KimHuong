const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// Route này chỉ Admin mới được gọi (hiện tại ta dùng tạm protect để yêu cầu đăng nhập)
router.get('/stats', protect, analyticsController.getAdminStats);

module.exports = router;