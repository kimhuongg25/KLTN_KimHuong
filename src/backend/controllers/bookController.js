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
    const { title, author, description, genre, publisher, publish_year, page_count, shelf_location, book_price, category_id } = req.body;

    const available_quantity = parseInt(req.body.available_quantity, 10) || 1;
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
      category_id 
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

// [GET] Tìm kiếm sách (ĐÃ NÂNG CẤP LÊN CẤP ĐỘ 1: ĐA TRƯỜNG)
exports.searchBooks = async (req, res) => {
  try {
    const { keyword } = req.query;
    let queryCondition = {};
    
    if (keyword) {
      const searchRegex = new RegExp(keyword, 'i');
      // Quét đồng thời Tên sách, Tác giả và Mô tả
      queryCondition.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { description: searchRegex }
      ];
    }

    const books = await Book.find(queryCondition).populate('category_id');

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
// CẤP ĐỘ 4: TÌM KIẾM BẰNG HÌNH ẢNH (OCR)
// ==========================================
// Thêm import công cụ băm ảnh ở đầu file bookController.js
const { generateImageHash, getHammingDistance } = require('../utils/imageHasher');

// [POST] Tìm kiếm sách bằng đối sánh hình ảnh bìa trực quan (Visual Search)
exports.searchByImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng tải ảnh bìa sách lên để tìm kiếm." });
    }

    // 1. Tính toán dấu vân tay của bức ảnh người dùng vừa upload lên quầy
    const uploadedImageHash = await generateImageHash(req.file.buffer);
    if (!uploadedImageHash) {
      return res.status(400).json({ message: "Không thể xử lý định dạng hình ảnh này." });
    }

    // 2. Lấy toàn bộ danh sách sách hiện có trong thư viện số để đối soát
    const allBooks = await Book.find().populate('category_id');
    const matchedResults = [];

    // 3. Tiến hành so khớp chéo cấu hình ảnh bìa
    for (let book of allBooks) {
      if (!book.cover_image) continue;

      // Nếu trong DB chưa lưu sẵn mã hash của sách, hệ thống sẽ tự động tính toán từ URL Cloudinary
      // (Để tối ưu lâu dài, bạn nên lưu thêm trường cover_image_hash vào Schema khi thêm sách)
      let bookHash = book.cover_image_hash;
      if (!bookHash) {
        bookHash = await generateImageHash(book.cover_image);
      }

      if (!bookHash) continue;

      // Tính khoảng cách khác biệt giữa ảnh của User và ảnh trong Kho sách
      const distance = getHammingDistance(uploadedImageHash, bookHash);

      // Nếu mức độ sai lệch nhỏ (Ngưỡng tiêu chuẩn là <= 12 bit khác biệt) thì coi như khớp bìa sách
      if (distance <= 12) {
        // Tính toán phần trăm giống nhau để hiển thị cho trực quan
        const similarityPercentage = Math.round(((64 - distance) / 64) * 100);
        
        matchedResults.push({
          book,
          similarity: similarityPercentage,
          distance
        });
      }
    }

    // 4. Sắp xếp kết quả: Cuốn nào có bìa giống nhất (similarity cao nhất) sẽ xếp lên đầu
    matchedResults.sort((a, b) => b.similarity - a.similarity);

    // Trích xuất lại danh sách sách tinh gọn để gửi trả về cho Frontend hiển thị
    const finalBooks = matchedResults.map(item => item.book);

    res.status(200).json({
      message: `Tìm kiếm thành công. Đã đối khớp cấu trúc bề mặt ảnh bìa.`,
      detectedText: "Tìm kiếm bằng dữ liệu hình ảnh", // Điền text tạm vào ô input của giao diện
      results: finalBooks
    });

  } catch (error) {
    console.error("Lỗi luồng tìm kiếm Visual Search:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// BỔ SUNG CÁC HÀM CẬP NHẬT VÀ XÓA SÁCH (ADMIN)
// ==========================================

// [PUT] Cập nhật thông tin sách
exports.updateBook = async (req, res) => {
  try {
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
      category_id 
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

// ==========================================
// TÍNH NĂNG MỚI: GỢI Ý CÁ NHÂN HÓA (CONTENT-BASED FILTERING)
// ==========================================

// [GET] Lấy danh sách sách gợi ý dựa trên lịch sử tương tác của Độc giả
exports.getPersonalizedRecommendations = async (req, res) => {
  try {
    const user_id = req.user._id;

    // 1. Lấy 10 hành vi gần nhất của user này trong DB
    const recentActivities = await UserActivity.find({ user_id })
      .populate('book_id')
      .sort({ createdAt: -1 })
      .limit(10);

    // 2. Phân tích các thể loại (genre) người dùng tương tác nhiều nhất
    const favoriteGenres = [];
    recentActivities.forEach(act => {
      if (act.book_id && act.book_id.genre) {
        favoriteGenres.push(act.book_id.genre);
      }
    });

    // Đếm tần suất xuất hiện của từng thể loại
    const genreCounts = favoriteGenres.reduce((acc, genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});

    // Sắp xếp thể loại được tương tác từ nhiều nhất đến ít nhất
    const sortedGenres = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a]);

    let recommendedBooks = [];

    if (sortedGenres.length > 0) {
      // 3. Tìm sách thuộc thể loại yêu thích nhất nhưng loại trừ các cuốn đã xem/mượn gần đây
      const interactedBookIds = recentActivities.map(act => act.book_id?._id);

      recommendedBooks = await Book.find({
        genre: { $in: sortedGenres.slice(0, 2) }, // Lấy 2 thể loại đứng đầu xu hướng cá nhân
        _id: { $nin: interactedBookIds },        // Tránh gợi ý lại sách họ vừa tương tác
        available_quantity: { $gt: 0 }            // Ưu tiên sách còn trong kho
      }).limit(4); // Lấy tối đa 4 cuốn để hiển thị đẹp 1 hàng trên giao diện
    }

    // 4. Fallback: Nếu độc giả mới tạo tài khoản (chưa có lịch sử), lấy 4 cuốn sách mới nhất làm gợi ý
    if (recommendedBooks.length === 0) {
      recommendedBooks = await Book.find({ available_quantity: { $gt: 0 } })
        .sort({ createdAt: -1 })
        .limit(4);
    }

    res.status(200).json(recommendedBooks);
  } catch (error) {
    console.error("Lỗi khi lấy sách gợi ý:", error);
    res.status(500).json({ error: error.message });
  }
};