const Review = require('../models/Review');
const UserActivity = require('../models/UserActivity');

// [POST] Thêm đánh giá mới (Bắt buộc đăng nhập)
exports.addReview = async (req, res) => {
  try {
    const { book_id, rating, comment } = req.body;
    const user_id = req.user._id;

    // Kiểm tra xem người dùng đã đánh giá cuốn sách này chưa
    const alreadyReviewed = await Review.findOne({ user_id, book_id });
    if (alreadyReviewed) {
      return res.status(400).json({ message: "Bạn đã đánh giá cuốn sách này rồi." });
    }

    const review = await Review.create({ user_id, book_id, rating, comment });

    // Ghi nhận hành vi chấm điểm cho AI
    await UserActivity.create({
      user_id: user_id,
      action_type: 'rate',
      book_id: book_id
    });

    res.status(201).json({ message: "Đánh giá thành công", review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// [GET] Lấy danh sách đánh giá của 1 cuốn sách (Ai cũng xem được)
exports.getBookReviews = async (req, res) => {
  try {
    const { book_id } = req.params;
    
    // ĐÃ SỬA: Chỉ lấy những đánh giá có trạng thái 'visible' (Đang hiển thị)
    // Kéo thêm fullName để tránh lỗi nếu tài khoản đăng ký theo cơ chế mới
    const reviews = await Review.find({ book_id, status: 'visible' })
      .populate('user_id', 'fullName username'); 
      
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// CÁC HÀM DÀNH RIÊNG CHO QUẢN TRỊ VIÊN (ADMIN)
// ==========================================

// [GET] Lấy tất cả đánh giá trên toàn hệ thống
exports.getAllReviewsAdmin = async (req, res) => {
  try {
    // Admin cần xem toàn bộ (cả bị ẩn lẫn đang hiện)
    // Bổ sung fullName và cover_image để hiển thị đẹp hơn trên bảng Quản lý
    const reviews = await Review.find()
      .populate('user_id', 'fullName username email')
      .populate('book_id', 'title cover_image')
      .sort({ createdAt: -1 }); 
      
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// [PUT] Ẩn / Hiện đánh giá (Thay thế cho hàm xóa)
exports.toggleReviewVisibilityAdmin = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    
    // Đảo ngược trạng thái
    review.status = review.status === 'visible' ? 'hidden' : 'visible';
    await review.save();

    const actionText = review.status === 'hidden' ? 'đã ẩn' : 'đã hiển thị lại';
    res.status(200).json({ message: `Đánh giá này ${actionText} thành công!` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};