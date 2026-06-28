const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ==========================================
// 1. ĐỊNH NGHĨA SCHEMA (CẤU TRÚC DATABASE)
// ==========================================
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true }, 
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['Nam', 'Nữ', 'Khác'], required: true },
  address: { type: String, required: true },
  password: { type: String, required: true }, 
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  // THÊM TRƯỜNG STATUS ĐỂ QUẢN LÝ KHÓA TÀI KHOẢN
  status: { type: String, enum: ['active', 'locked'], default: 'active' }, 
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
}, { timestamps: true });

// Hàm băm mật khẩu tự động trước khi lưu
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Khởi tạo Model
const User = mongoose.model('User', userSchema);
module.exports = User;


// ==========================================
// 2. CÁC HÀM XỬ LÝ LOGIC (CONTROLLERS)
// ==========================================

// Hàm tạo Token xác thực (JWT)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '30d' }); 
};

// [POST] Đăng ký User mới
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, dob, gender, address, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email này đã được sử dụng!" });
    }

    const user = await User.create({ 
      fullName, email, phone, dob, gender, address, password 
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.fullName, 
        email: user.email,
        role: user.role,
        status: user.status,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [POST] Đăng nhập
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      
      // BỔ SUNG CHỐT CHẶN: KIỂM TRA TÀI KHOẢN CÓ BỊ KHÓA KHÔNG
      if (user.status === 'locked') {
        return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Thư viện!" });
      }

      res.json({
        _id: user._id,
        username: user.fullName, 
        email: user.email,
        role: user.role,
        status: user.status,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: "Email hoặc mật khẩu không chính xác!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [GET] Lấy thông tin Cá nhân (Profile)
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites', 'title cover_image author');
    
    if (user) {
      res.json({
        _id: user._id,
        username: user.fullName, 
        email: user.email,
        phone: user.phone, 
        dob: user.dob,
        gender: user.gender,
        address: user.address,
        role: user.role,
        status: user.status,
        favorites: user.favorites
      });
    } else {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [POST] Thêm hoặc Bỏ yêu thích sách
exports.toggleFavorite = async (req, res) => {
  try {
    const { book_id } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    if (!user.favorites) {
      user.favorites = [];
    }

    const index = user.favorites.indexOf(book_id);
    if (index === -1) {
      user.favorites.push(book_id);
      await user.save();
      return res.status(200).json({ message: "Đã thêm vào danh sách yêu thích ❤️", isFavorite: true });
    } else {
      user.favorites.splice(index, 1);
      await user.save();
      return res.status(200).json({ message: "Đã bỏ yêu thích 🤍", isFavorite: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 3. CÁC HÀM DÀNH RIÊNG CHO QUẢN TRỊ VIÊN (ADMIN)
// ==========================================

// [GET] Lấy danh sách toàn bộ người dùng
exports.getAllUsers = async (req, res) => {
  try {
    // Chỉ lấy tài khoản 'user' thường và loại bỏ trường password để bảo mật
    const users = await User.find({ role: 'user' }).select('-password');
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
    
    // Bảo vệ Quản trị viên: Không cho phép Admin tự khóa mình
    if (user.role === 'admin') {
      return res.status(403).json({ message: "Không thể khóa tài khoản Quản trị viên!" });
    }

    // Đảo ngược trạng thái
    user.status = user.status === 'active' ? 'locked' : 'active';
    await user.save();
    
    const action = user.status === 'locked' ? 'Khóa' : 'Mở khóa';
    res.status(200).json({ message: `Đã ${action} tài khoản thành công!` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// [PUT] Cấp quyền / Thu hồi quyền Quản trị
exports.changeUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    // Cấp quyền Admin cho Độc giả, hoặc hạ Admin xuống làm Độc giả
    user.role = user.role === 'user' ? 'admin' : 'user';
    await user.save();
    
    res.status(200).json({ message: `Đã cập nhật quyền thành: ${user.role.toUpperCase()}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};