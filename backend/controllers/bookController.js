const Book = require('../models/Book');
const UserActivity = require('../models/UserActivity'); // Gọi model Hành vi để lưu vết

// [GET] Lấy danh sách toàn bộ sách
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate('category_id');
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// [POST] Thêm sách mới vào thư viện
exports.createBook = async (req, res) => {
  try {
    // 1. ĐÃ BỔ SUNG category_id VÀO ĐÂY
    const { title, author, description, genre, publisher, publish_year, page_count, shelf_location, book_price, category_id } = req.body;

    const available_quantity = parseInt(req.body.available_quantity, 10) || 1;
    // Ép kiểu cho giá đền bù, nếu không nhập thì mặc định là 0
    const price = parseInt(book_price, 10) || 0; 

    let cover_image = '';
    
    if (req.file) {
      cover_image = req.file.path; 
    } else if (req.body.cover_image) {
      cover_image = req.body.cover_image; 
    }

    const newBook = await Book.create({
      title, 
      author, 
      description, 
      genre, 
      publisher, 
      publish_year, 
      page_count, 
      available_quantity, 
      shelf_location,
      book_price: price,
      cover_image,
      category_id // 2. ĐÃ BỔ SUNG DÒNG NÀY ĐỂ LƯU XUỐNG DB
    });

    res.status(201).json({ message: "Thêm sách thành công!", book: newBook });
  } catch (error) {
    console.error("Lỗi khi thêm sách:", error);
    res.status(500).json({ error: error.message });
  }
};

// [GET] Xem chi tiết 1 cuốn sách (Ghi nhận hành vi View)
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });

    // Nếu người dùng đã đăng nhập (có gắn token), ghi nhận hành vi xem sách
    if (req.user) {
      await UserActivity.create({
        user_id: req.user._id,
        action_type: 'view',
        book_id: book._id
      });
    }

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// [GET] Tìm kiếm sách (Ghi nhận hành vi Search)
exports.searchBooks = async (req, res) => {
  try {
    const { keyword } = req.query;
    
    // Tìm kiếm sách theo tiêu đề (không phân biệt chữ hoa, chữ thường)
    const books = await Book.find({ title: { $regex: keyword, $options: 'i' } });

    // Nếu có người dùng đăng nhập và có nhập từ khóa, lưu lại lịch sử tìm kiếm
    if (req.user && keyword) {
      await UserActivity.create({
        user_id: req.user._id,
        action_type: 'search',
        keyword: keyword
      });
    }

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// BỔ SUNG CÁC HÀM CẬP NHẬT VÀ XÓA SÁCH (ADMIN)
// ==========================================

// [PUT] Cập nhật thông tin sách
exports.updateBook = async (req, res) => {
  try {
    // 3. ĐÃ BỔ SUNG category_id VÀO ĐÂY
    const { title, author, description, genre, publisher, publish_year, page_count, shelf_location, book_price, category_id } = req.body;

    const available_quantity = parseInt(req.body.available_quantity, 10) || 1;
    const price = parseInt(book_price, 10) || 0;

    // Đóng gói dữ liệu cần cập nhật
    let updateData = {
      title, 
      author, 
      description, 
      genre, 
      publisher, 
      publish_year, 
      page_count, 
      available_quantity, 
      shelf_location,
      book_price: price,
      category_id // 4. ĐÃ BỔ SUNG DÒNG NÀY ĐỂ LƯU XUỐNG DB
    };

    if (req.file) {
      updateData.cover_image = req.file.path; 
    } else if (req.body.cover_image) {
      updateData.cover_image = req.body.cover_image; 
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true } 
    );
    
    if (!updatedBook) {
      return res.status(404).json({ message: "Không tìm thấy sách để cập nhật" });
    }

    res.status(200).json({ message: "Cập nhật thông tin sách thành công!", book: updatedBook });
  } catch (error) {
    console.error("Lỗi khi cập nhật sách:", error);
    res.status(500).json({ error: error.message });
  }
};

// [DELETE] Xóa sách khỏi thư viện
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: "Không tìm thấy sách để xóa" });
    res.status(200).json({ message: "Xóa sách thành công!" });
  } catch (error) {
    console.error("Lỗi khi xóa sách:", error);
    res.status(500).json({ error: error.message });
  }
};