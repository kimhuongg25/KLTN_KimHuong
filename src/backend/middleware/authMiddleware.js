const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Kiểm tra xem header Authorization có chứa token bắt đầu bằng chữ 'Bearer' không
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Tách chuỗi lấy đúng phần token
      token = req.headers.authorization.split(' ')[1];

      // Giải mã token để lấy ID của người dùng
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Tìm user trong database và gắn vào request, loại bỏ cột password cho an toàn
      req.user = await User.findById(decoded.id).select('-password');
      next(); // Cho phép đi tiếp vào Controller
    } catch (error) {
      res.status(401).json({ message: "Không có quyền truy cập, token không hợp lệ hoặc đã hết hạn" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Không có quyền truy cập, không tìm thấy token" });
  }
};

// Middleware kiểm tra quyền Admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // Nếu là admin thì cho phép đi tiếp
  } else {
    res.status(403).json({ message: "Truy cập bị từ chối. Chỉ dành cho Quản trị viên!" });
  }
};

module.exports = { protect, admin };