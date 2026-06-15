const Category = require('../models/Category');
const Book = require('../models/Book');

// 1. [POST] Thêm danh mục mới
exports.createCategory = async (req, res) => {
  try {
    const { category_name } = req.body;
    const oldCategory = await Category.findOne({ category_name });
    if (oldCategory) {
      return res.status(400).json({ message: "Danh mục này đã tồn tại!" });
    }
    const newCategory = new Category({ category_name });
    await newCategory.save();
    res.status(201).json({ message: "Thêm danh mục thành công!", category: newCategory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. [GET] Lấy toàn bộ danh mục
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. [PUT] Cập nhật danh mục
exports.updateCategory = async (req, res) => {
  try {
    const { category_name } = req.body;
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { category_name },
      { new: true }
    );
    if (!updatedCategory) return res.status(404).json({ message: "Không tìm thấy danh mục" });
    res.status(200).json({ message: "Cập nhật thành công!", category: updatedCategory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. [DELETE] Xóa danh mục
exports.deleteCategory = async (req, res) => {
  try {
    // Kiểm tra xem có sách nào đang thuộc danh mục này không trước khi xóa
    const hasBook = await Book.findOne({ category_id: req.params.id });
    if (hasBook) {
      return res.status(400).json({ message: "Không thể xóa! Đang có sách thuộc danh mục này." });
    }
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Xóa danh mục thành công!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};