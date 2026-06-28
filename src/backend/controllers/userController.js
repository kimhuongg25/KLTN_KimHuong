const User = require('../models/User');
const UserActivity = require('../models/UserActivity'); // Gọi model Hành vi
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '30d' });
};

// [GET] Lấy thông tin user
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    
    user.password = undefined; // Ẩn mật khẩu trước khi trả về
    
    // Ánh xạ fullName thành username để Frontend cũ không bị lỗi
    const userData = user.toObject();
    userData.username = userData.fullName; 

    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// [PUT] Cập nhật thông tin cá nhân
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản!' });

    user.fullName = req.body.fullName || req.body.username || user.fullName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.dob = req.body.dob || user.dob;
    user.gender = req.body.gender || user.gender;
    user.address = req.body.address || user.address;

    if (req.body.password) {
      user.password = req.body.password; 
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.fullName, 
      email: updatedUser.email,
      phone: updatedUser.phone,
      dob: updatedUser.dob,
      gender: updatedUser.gender,
      address: updatedUser.address,
      role: updatedUser.role,
      message: "Cập nhật hồ sơ thành công!"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// [POST] Đăng ký
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, dob, gender, address, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email này đã được sử dụng!" });

    const user = await User.create({ 
      fullName, email, phone, dob, gender, address, password 
    });

    res.status(201).json({ 
      message: "Đăng ký thành công", 
      _id: user._id, 
      username: user.fullName, 
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  } 
};

// [POST] Đăng nhập
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Chặn nếu bị khóa
      if (user.status === 'locked') {
        return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Thư viện!" });
      }

      res.status(200).json({
        message: "Đăng nhập thành công", 
        _id: user._id, 
        username: user.fullName, 
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: "Email hoặc mật khẩu không chính xác" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// [POST] Thêm/Xóa Sách Yêu Thích
exports.toggleFavorite = async (req, res) => {
  try {
    const { book_id } = req.body;
    const user = await User.findById(req.user._id);

    const isFavorited = user.favorites.includes(book_id);

    if (isFavorited) {
      user.favorites.pull(book_id);
      await user.save();
      res.status(200).json({ message: "Đã bỏ yêu thích sách" });
    } else {
      user.favorites.push(book_id);
      await user.save();
      
      await UserActivity.create({
        user_id: req.user._id,
        action_type: 'favorite',
        book_id: book_id
      });
      res.status(200).json({ message: "Đã thêm vào danh sách yêu thích" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// CÁC HÀM DÀNH RIÊNG CHO QUẢN TRỊ VIÊN (ADMIN)
// ==========================================

// [GET] Lấy danh sách toàn bộ người dùng
exports.getAllUsers = async (req, res) => {
  try {
    // Không lọc role: 'user' nữa để hiển thị cả Admin trên bảng Quản lý
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// [PUT] Khóa / Mở khóa tài khoản độc giả
exports.toggleLockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    
    if (user.role === 'admin') {
      return res.status(403).json({ message: "Không thể khóa tài khoản Quản trị viên!" });
    }

    user.status = user.status === 'active' ? 'locked' : 'active';
    await user.save();
    
    const action = user.status === 'locked' ? 'Khóa' : 'Mở khóa';
    res.status(200).json({ message: `Đã ${action} tài khoản thành công!` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// [PUT] Cấp quyền / Thu hồi quyền
exports.changeUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    user.role = user.role === 'user' ? 'admin' : 'user';
    await user.save();
    
    res.status(200).json({ message: `Đã cập nhật quyền thành: ${user.role.toUpperCase()}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};