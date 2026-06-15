const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  cover_image: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  available_quantity: { type: Number, required: true, default: 1 },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  
  // Các trường phục vụ tính năng tự động điền
  publish_year: { type: String },
  publisher: { type: String },
  genre: { type: String },
  page_count: { type: Number },

  // --- BỔ SUNG MỚI ---
  shelf_location: { type: String, default: "Chưa xác định" }, // Vị trí kệ sách
  book_price: { type: Number, required: true, default: 50000 } // Giá tiền cuốn sách (phục vụ tính phí phạt)
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);