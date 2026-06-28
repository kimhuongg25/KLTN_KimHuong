const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  // THÊM TRƯỜNG NÀY ĐỂ QUẢN LÝ TRẠNG THÁI ẨN/HIỆN ĐÁNH GIÁ
  status: { type: String, enum: ['visible', 'hidden'], default: 'visible' }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);