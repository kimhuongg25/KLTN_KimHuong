const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');
const { protect, admin } = require('../middleware/authMiddleware');

// ==========================================
// API DÀNH CHO ĐỘC GIẢ
// ==========================================
// Gửi yêu cầu mượn sách có chọn ngày dự kiến
router.post('/', protect, borrowController.borrowBook); 

// Xem lịch sử phiếu mượn cá nhân
router.get('/my-history', protect, borrowController.getMyBorrowHistory); 


// ==========================================
// API DÀNH RIÊNG CHO QUẢN TRỊ VIÊN (ADMIN)
// ==========================================
// Lấy danh sách toàn bộ phiếu mượn để quản lý
router.get('/admin/list', protect, admin, borrowController.getAllBorrowRequests);

// Cập nhật trạng thái phiếu (Duyệt / Từ chối / Giao sách / Trả sách)
router.put('/admin/status/:record_id', protect, admin, borrowController.updateBorrowStatus);

// MỚI: Lấy danh sách các khoản phạt (Thu phạt)
router.get('/admin/fines', protect, admin, borrowController.getAllFines);

// MỚI: Xác nhận thanh toán khoản phạt và tự động mở khóa thẻ
router.put('/admin/fines/:id/pay', protect, admin, borrowController.payFine);

// 🔒 Đã bổ sung middleware 'admin' để bảo mật dữ liệu thống kê
router.get('/admin/stats', protect, admin, borrowController.getMonthlyStats);
router.get('/admin/stats/daily', protect, admin, borrowController.getDailyStats);

module.exports = router;