const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Nhúng thêm Controller xử lý thuật toán gợi ý
const recommendationController = require('../controllers/recommendationController'); 

const { protect } = require('../middleware/authMiddleware');

// ==========================================
// API DÀNH CHO NGƯỜI DÙNG CƠ BẢN
// ==========================================
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// ⚡ Đã gộp GET và PUT cho tính năng Hồ sơ cá nhân vào đây
router.route('/profile')
  .get(protect, userController.getUserProfile)
  .put(protect, userController.updateUserProfile);

router.post('/favorites', protect, userController.toggleFavorite); // API yêu thích sách

// Trỏ API này vào đúng hàm getRecommendations của recommendationController
router.get('/recommendations', protect, recommendationController.getRecommendations);

// ==========================================
// API DÀNH CHO ADMIN
// ==========================================
router.get('/', protect, userController.getAllUsers);

// ⚡ ĐÃ THAY THẾ: Xóa hàm DELETE cũ, thêm 2 route PUT để xử lý Khóa và Phân quyền
router.put('/:id/lock', protect, userController.toggleLockUser);
router.put('/:id/role', protect, userController.changeUserRole);

module.exports = router;