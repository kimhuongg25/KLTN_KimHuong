const Book = require('../models/Book');
const User = require('../models/User');
const BorrowRecord = require('../models/BorrowRecord');

exports.getAdminStats = async (req, res) => {
  try {
    // Đếm tổng số lượng sách và tổng số người dùng (chỉ đếm user thường)
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Đếm số lượng phiếu mượn theo trạng thái
    const pendingBorrows = await BorrowRecord.countDocuments({ status: 'pending' });
    const activeBorrows = await BorrowRecord.countDocuments({ status: 'approved' });

    // Tính tổng doanh thu từ tiền phạt
    const recordsWithFines = await BorrowRecord.find({ 'fine.amount': { $gt: 0 } });
    const totalFines = recordsWithFines.reduce((sum, record) => sum + (record.fine.amount || 0), 0);

    // Trả toàn bộ dữ liệu về cho Frontend dưới dạng 1 Object gọn gàng
    res.status(200).json({
      totalBooks,
      totalUsers,
      pendingBorrows,
      activeBorrows,
      totalFines
    });
  } catch (error) {
    console.error("Lỗi khi thống kê dữ liệu:", error);
    res.status(500).json({ error: error.message });
  }
};