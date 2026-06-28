const mongoose = require('mongoose');

const borrowRecordSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  book_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Book', 
    required: true 
  },
  
  // 1. THÊM 2 TRƯỜNG DỮ LIỆU TỪ FORM ĐỘC GIẢ GỬI LÊN
  expected_borrow_date: { type: Date, required: true },
  expected_return_date: { type: Date, required: true },

  // 2. MỞ RỘNG TRẠNG THÁI (Bổ sung 'borrowed' - đang cầm sách và 'overdue' - quá hạn)
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'borrowed', 'rejected', 'returned', 'overdue'], 
    default: 'pending' // Bắt buộc: Vừa mượn xong sẽ ở trạng thái Chờ duyệt
  },
  
  borrow_date: { type: Date }, // Ngày thực tế Thủ thư giao sách
  due_date: { type: Date },    // Hạn trả sách thực tế (Admin ấn định khi duyệt/giao sách)
  return_date: { type: Date }, // Ngày mang sách đến trả thực tế
  
  // Object lưu thông tin tiền phạt (Giữ nguyên cực chuẩn)
  fine: {
    amount: { type: Number, default: 0 },
    reason: { type: String },
    status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' }
  }
}, { timestamps: true });

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);