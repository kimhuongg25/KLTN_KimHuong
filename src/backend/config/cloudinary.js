const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cấu hình thông tin tài khoản Cloudinary của bạn
// Khuyên dùng: Đưa các thông số này vào file .env để bảo mật hơn
cloudinary.config({
  cloud_name: 'dzajty0pk', 
  api_key: '634194596635419', 
  api_secret: '**********' 
});

// Cấu hình kho lưu trữ
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'smart_library', // Tên thư mục sẽ tự tạo trên Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Các định dạng ảnh cho phép
  },
});

const upload = multer({ storage: storage });

module.exports = upload;