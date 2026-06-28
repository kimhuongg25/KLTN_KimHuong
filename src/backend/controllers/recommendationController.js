const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Lấy toàn bộ sách người dùng đã mượn
    const borrows = await BorrowRecord.find({ user_id: userId }).populate('book_id');
    
    // Nếu người dùng mới, chưa mượn sách nào -> Gợi ý sách mới nhất trong kho (Cold Start Problem)
    if (!borrows || borrows.length === 0) {
      const latestBooks = await Book.find().sort({ createdAt: -1 }).limit(5);
      const defaultRecs = latestBooks.map(book => ({
        book_id: book,
        score: 0.85 // Mặc định độ phù hợp 85% cho sách mới/hot
      }));
      return res.status(200).json(defaultRecs);
    }

    // 2. Phân tích sở thích (Đếm tần suất Thể loại người dùng hay mượn)
    const borrowedBookIds = new Set();
    const genrePreferences = {};

    borrows.forEach(record => {
      if (record.book_id) {
        borrowedBookIds.add(record.book_id._id.toString()); // Lưu ID để lát không gợi ý lại sách đã mượn
        
        // Cắt chuỗi thể loại thành mảng (VD: "Khoa học, Viễn tưởng" -> ['Khoa học', 'Viễn tưởng'])
        const genres = record.book_id.genre ? record.book_id.genre.split(',').map(g => g.trim()) : [];
        genres.forEach(g => {
          if (g) {
            genrePreferences[g] = (genrePreferences[g] || 0) + 1; // Cộng điểm cho thể loại này
          }
        });
      }
    });

    // 3. Quét toàn bộ sách trong kho (Loại trừ những cuốn đã mượn)
    const availableBooks = await Book.find({ _id: { $nin: Array.from(borrowedBookIds) } });

    // 4. Thuật toán chấm điểm (Scoring)
    let scoredBooks = availableBooks.map(book => {
      let score = 0;
      const bookGenres = book.genre ? book.genre.split(',').map(g => g.trim()) : [];
      
      // Nếu sách có thể loại trùng với sở thích, cộng điểm tương ứng với tần suất
      bookGenres.forEach(g => {
        if (genrePreferences[g]) {
          score += genrePreferences[g]; 
        }
      });

      return { book_id: book, raw_score: score };
    });

    // Lọc ra những sách có điểm > 0 và sắp xếp từ cao xuống thấp
    scoredBooks = scoredBooks.filter(item => item.raw_score > 0).sort((a, b) => b.raw_score - a.raw_score);

    // 5. Chuẩn hóa điểm số thành phần trăm (%) để hiển thị đẹp trên UI
    const maxScore = scoredBooks.length > 0 ? scoredBooks[0].raw_score : 1;
    const finalRecommendations = scoredBooks.slice(0, 5).map(item => {
      // Công thức tính % matching (Tối đa 98% để tạo cảm giác tự nhiên)
      let matchPercentage = (item.raw_score / maxScore) * 0.98;
      // Đảm bảo mức tối thiểu là 45% nếu đã có điểm
      matchPercentage = Math.max(matchPercentage, 0.45); 

      return {
        book_id: item.book_id,
        score: matchPercentage
      };
    });

    // Nếu thuật toán không tìm được sách phù hợp, bù thêm sách mới vào cho đủ list
    if (finalRecommendations.length === 0) {
      const fallbackBooks = await Book.find({ _id: { $nin: Array.from(borrowedBookIds) } }).sort({ createdAt: -1 }).limit(4);
      fallbackBooks.forEach(b => finalRecommendations.push({ book_id: b, score: 0.65 }));
    }

    res.status(200).json(finalRecommendations);
  } catch (error) {
    console.error("Lỗi thuật toán gợi ý:", error);
    res.status(500).json({ error: error.message });
  }
};