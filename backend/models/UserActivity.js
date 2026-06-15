const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action_type: { type: String, enum: ['search', 'view', 'borrow', 'favorite'], required: true },
  keyword: { type: String },
  book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' }
}, { timestamps: true });

module.exports = mongoose.model('UserActivity', userActivitySchema);