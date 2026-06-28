const { GoogleGenerativeAI } = require("@google/generative-ai");
const Book = require('../models/Book');
const User = require('../models/User');
const BorrowRecord = require('../models/BorrowRecord');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithAI = async (req, res) => {
  try {
    // 1. Nhận thêm Lịch sử chat (history) và Tên người dùng (username) từ Frontend
    const { message, history, username } = req.body;
    if (!message) return res.status(400).json({ error: "Vui lòng nhập câu hỏi." });

    // 2. Lấy dữ liệu kho sách
    const books = await Book.find().select('title author available_quantity shelf_location genre book_price');
    const bookListText = books.map(b => 
      `- "${b.title}" (Tác giả: ${b.author}) | Thể loại: ${b.genre} | Số lượng: ${b.available_quantity} | Kệ: ${b.shelf_location} | Giá đền: ${b.book_price}đ`
    ).join('\n');

    // 3. Xử lý Trí nhớ ngữ cảnh (Lấy 6 tin nhắn gần nhất để AI nhớ luồng câu chuyện)
    let historyText = "";
    if (history && history.length > 0) {
      // Bỏ qua tin nhắn chào mừng mặc định, chỉ lấy lịch sử trò chuyện thực tế
      const realHistory = history.filter(msg => msg.text !== "Xin chào! Mình là Trợ lý AI của Smart Library. Bạn cần tìm sách gì hay muốn hỏi về nội quy thư viện không?");
      
      if (realHistory.length > 0) {
        historyText = "\nLỊCH SỬ TRÒ CHUYỆN TRƯỚC ĐÓ (Dùng để hiểu ngữ cảnh nếu người dùng dùng đại từ nhân xưng như 'nó', 'sách đó'):\n";
        // Chỉ lấy 6 dòng gần nhất để tránh tràn bộ nhớ
        historyText += realHistory.slice(-6).map(msg => `${msg.isBot ? 'Bot' : 'Người dùng'}: ${msg.text}`).join('\n');
      }
    }

    // 4. Cá nhân hóa câu chào
    const userGreeting = username ? `Đang trò chuyện với độc giả tên là: ${username}. Hãy xưng hô thân thiện bằng tên của họ.` : `Đang trò chuyện với khách vãng lai.`;

    // 5. Viết lại System Prompt (Não bộ của AI)
    const systemPrompt = `
      Bạn là "Smart Librarian" - Trợ lý ảo AI của thư viện. ${userGreeting}
      
      NỘI QUY: Mượn tối đa 14 ngày, phạt 5.000đ/ngày trễ, hỏng sách đền 50-100% giá. Phải đăng nhập mới được mượn.
      DANH SÁCH SÁCH THỰC TẾ TRONG KHO:
      ${bookListText}
      ${historyText}

      HƯỚNG DẪN TRẢ LỜI:
      - Đọc kỹ Lịch sử trò chuyện để hiểu khách đang nói về vấn đề gì hoặc cuốn sách nào trước đó.
      - Trả lời ngắn gọn, súc tích (3-4 câu). Trình bày rõ ràng.
      - Nếu hỏi sách, luôn báo Số lượng còn và Vị trí kệ.

      Câu hỏi hiện tại của người dùng: "${message}"
      Trả lời:
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    res.status(200).json({ reply: responseText });
  } catch (error) {
    console.error("Lỗi Trợ lý ảo AI:", error);
    res.status(500).json({ error: "Xin lỗi, hệ thống AI đang bận hoặc quá tải. Vui lòng thử lại sau!" });
  }
};

exports.adminChatWithAI = async (req, res) => {
  try {
    const { message, history, username } = req.body;
    if (!message) return res.status(400).json({ error: "Vui lòng nhập câu hỏi." });

    // 1. LẤY DỮ LIỆU THỐNG KÊ TOÀN HỆ THỐNG CHO ADMIN
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const pendingBorrows = await BorrowRecord.countDocuments({ status: 'pending' });
    
    // Gom nhóm để xem thể loại nào đang được mượn nhiều nhất (Xu hướng đọc)
    const trendingGenres = await BorrowRecord.aggregate([
      { $lookup: { from: 'books', localField: 'book_id', foreignField: '_id', as: 'book' } },
      { $unwind: '$book' },
      { $group: { _id: '$book.genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);
    const trendText = trendingGenres.map(g => `${g._id} (${g.count} lượt)`).join(', ');

    // Lấy thông tin kho sách
    const books = await Book.find().select('title author available_quantity genre');
    const bookListText = books.map(b => `- "${b.title}" | Tồn kho: ${b.available_quantity} | Thể loại: ${b.genre}`).join('\n');

    // 2. XỬ LÝ LỊCH SỬ CHAT
    let historyText = "";
    if (history && history.length > 0) {
      const realHistory = history.filter(msg => msg.text !== "Xin chào Admin! Mình là Trợ lý Quản trị. Sếp cần xem báo cáo, thống kê hay tra cứu kho sách hôm nay?");
      if (realHistory.length > 0) {
        historyText = "\nLỊCH SỬ TRÒ CHUYỆN:\n" + realHistory.slice(-6).map(msg => `${msg.isBot ? 'Bot' : 'Admin'}: ${msg.text}`).join('\n');
      }
    }

    // 3. SYSTEM PROMPT DÀNH RIÊNG CHO ADMIN
    const systemPrompt = `
      Bạn là "Admin Assistant" - Trợ lý AI CẤP CAO dành riêng cho Ban Quản trị Thư viện. 
      Sếp của bạn tên là: ${username}. Hãy xưng hô chuyên nghiệp, cung cấp số liệu rõ ràng.

      DỮ LIỆU HỆ THỐNG HIỆN TẠI (Real-time):
      - Tổng số sách trong kho: ${totalBooks}
      - Tổng số độc giả: ${totalUsers}
      - Số phiếu mượn ĐANG CHỜ DUYỆT: ${pendingBorrows} (Nhắc admin vào duyệt nếu có).
      - XU HƯỚNG ĐỌC (Top 3 thể loại mượn nhiều nhất): ${trendText}.

      DANH SÁCH KHO SÁCH (Để tra cứu nhanh):
      ${bookListText}
      ${historyText}

      NHIỆM VỤ CỦA BẠN:
      1. Báo cáo thống kê nhanh gọn khi sếp hỏi.
      2. Gợi ý nhập thêm sách mới dựa trên XU HƯỚNG ĐỌC hiện tại (gợi ý tên sách cụ thể trên thị trường phù hợp với thể loại đang hot).
      3. Giải đáp các câu hỏi về nghiệp vụ quản lý.
      
      Câu lệnh của sếp: "${message}"
      Trả lời:
    `;

    // Nhớ dùng đúng tên model của bạn (ví dụ: gemini-pro hoặc gemini-1.5-flash)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(systemPrompt);
    
    res.status(200).json({ reply: result.response.text() });
  } catch (error) {
    console.error("Lỗi AI Admin:", error);
    res.status(500).json({ error: "Lỗi kết nối AI Quản trị." });
  }
};