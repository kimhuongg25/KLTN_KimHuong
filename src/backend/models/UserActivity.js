const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // ĐÃ BỔ SUNG TỪ KHÓA 'rate' VÀO MẢNG ENUM DƯỚI ĐÂY
  action_type: { type: String, enum: ['search', 'view', 'borrow', 'favorite', 'rate'], required: true },
  
  keyword: { type: String },
  book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' }
}, { timestamps: true });

module.exports = mongoose.model('UserActivity', userActivitySchema);