const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  category_name: { 
    type: String, 
    required: true, 
    unique: true, // Chống trùng lặp tên danh mục
    trim: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);