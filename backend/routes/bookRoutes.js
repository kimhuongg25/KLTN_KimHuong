const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');

// Khai báo middleware protect. Dùng 'optional' nghĩa là không có token vẫn cho xem/tìm, nhưng có token thì sẽ được lưu hành vi.
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protectOptional = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      console.log("Token không hợp lệ, tiếp tục như người dùng ẩn danh");
    }
  }
  next();
};

// Các route cho khách/độc giả
router.get('/', bookController.getAllBooks);
router.get('/search', protectOptional, bookController.searchBooks);
router.get('/:id', protectOptional, bookController.getBookById);

// CÁC ROUTE DÀNH RIÊNG CHO ADMIN (Phải có Token và Multer)
// ĐÃ SỬA: Thêm protect và upload.single vào route POST
router.post('/', protect, upload.single('cover_image'), bookController.createBook);

router.put('/:id', protect, upload.single('cover_image'), bookController.updateBook);
router.delete('/:id', protect, bookController.deleteBook);

module.exports = router;