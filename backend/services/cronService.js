const cron = require('node-cron');
const nodemailer = require('nodemailer');
const BorrowRecord = require('../models/BorrowRecord');

// ==========================================
// 1. CẤU HÌNH TÀI KHOẢN GỬI EMAIL CHUNG
// ==========================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ==========================================
// 2. HÀM GỬI EMAIL TỨC THỜI (KHI ADMIN BẤM GIAO SÁCH)
// ==========================================
const sendBorrowConfirmationEmail = async (record) => {
  try {
    const userEmail = record.user_id?.email;
    const userName = record.user_id?.fullName || record.user_id?.username;
    const bookTitle = record.book_id?.title;
    
    const borrowDateStr = new Date(record.borrow_date).toLocaleDateString('vi-VN');
    const dueDateStr = new Date(record.due_date).toLocaleDateString('vi-VN');

    if (!userEmail) return console.log("⚠️ Không tìm thấy email của độc giả để gửi thông báo.");

    const mailOptions = {
      from: `"Thư Viện Thông Minh" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '📚 [Thư Viện Thông Minh] - Xác nhận giao sách thành công',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="background-color: #4f46e5; padding: 24px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 24px; font-weight: bold;">XÁC NHẬN GIAO SÁCH THÀNH CÔNG</h2>
          </div>
          <div style="padding: 30px; background-color: #ffffff; color: #374151; line-height: 1.6;">
            <p style="font-size: 16px;">Xin chào <strong>${userName}</strong>,</p>
            <p style="font-size: 16px;">Hệ thống thư viện xác nhận bạn đã nhận sách trực tiếp tại quầy thành công. Dưới đây là thông tin chi tiết về phiếu mượn của bạn:</p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 16px;">
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #4b5563; width: 40%;">Mã phiếu:</td>
                  <td style="padding: 6px 0; color: #111827; font-weight: bold;">#${record._id.toString().substring(record._id.toString().length - 6).toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #4b5563;">Sách mượn:</td>
                  <td style="padding: 6px 0; color: #4f46e5; font-weight: bold;">📘 ${bookTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #4b5563;">Ngày lấy sách:</td>
                  <td style="padding: 6px 0; color: #111827; font-weight: bold;">📆 ${borrowDateStr}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #ef4444;">Hạn trả sách:</td>
                  <td style="padding: 6px 0; color: #dc2626; font-weight: bold;">⚠️ ${dueDateStr}</td>
                </tr>
              </table>
            </div>
            <p style="color: #6b7280; font-size: 14px; font-style: italic;">* Vui lòng bảo quản sách nguyên vẹn và hoàn trả đúng hạn để tránh phí phạt trễ hạn (5.000 VNĐ/ngày).</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Đã gửi email xác nhận mượn sách tới: ${userEmail}`);
  } catch (error) {
    console.error('❌ Lỗi khi thực hiện gửi Email:', error.message);
  }
};

// ==========================================
// 3. HÀM CHẠY TÁC VỤ TỰ ĐỘNG (CRONJOB)
// ==========================================
const startCronJobs = () => {
  console.log('⏳ CronJob: Đã khởi động dịch vụ quét phiếu mượn tự động...');

  cron.schedule('0 8 * * *', async () => {
    console.log('🔍 CronJob: Đang quét các phiếu mượn lúc', new Date().toLocaleString('vi-VN'));

    try {
      const activeBorrows = await BorrowRecord.find({ status: { $in: ['borrowed', 'overdue'] } })
        .populate('user_id', 'fullName username email')
        .populate('book_id', 'title');

      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      for (const record of activeBorrows) {
        if (!record.due_date || !record.user_id?.email) continue;

        const dueDate = new Date(record.due_date);
        dueDate.setHours(0, 0, 0, 0);

        const timeDiff = dueDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)); 

        const readerName = record.user_id.fullName || record.user_id.username;
        let mailOptions = null;

        if (daysDiff === 1 && record.status === 'borrowed') {
          mailOptions = {
            from: `"Thư Viện Thông Minh" <${process.env.EMAIL_USER}>`,
            to: record.user_id.email,
            subject: '📚 Nhắc nhở: Sắp đến hạn trả sách!',
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151;">
                <h3 style="color: #4f46e5;">Xin chào ${readerName},</h3>
                <p>Hệ thống Thư viện Thông minh xin nhắc nhở bạn:</p>
                <p>Cuốn sách <strong>"${record.book_id.title}"</strong> của bạn sẽ đến hạn trả vào ngày mai <strong>(${dueDate.toLocaleDateString('vi-VN')})</strong>.</p>
                <p>Vui lòng sắp xếp thời gian đến thư viện để hoàn trả sách, tránh phát sinh phí phạt nhé.</p>
                <br/>
                <p>Trân trọng,<br/>Ban Quản Trị Thư Viện</p>
              </div>
            `
          };
        } 
        else if (daysDiff < 0) {
          const overdueDays = Math.abs(daysDiff); 
          const estimatedFine = overdueDays * 5000; 

          if (record.status === 'borrowed') {
            record.status = 'overdue';
            await record.save();
          }

          mailOptions = {
            from: `"Thư Viện Thông Minh" <${process.env.EMAIL_USER}>`,
            to: record.user_id.email,
            subject: '⚠️ Cảnh báo: Quá hạn trả sách!',
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151;">
                <h3 style="color: #dc2626;">Xin chào ${readerName},</h3>
                <p>Hệ thống ghi nhận bạn đang giữ cuốn sách <strong>"${record.book_id.title}"</strong> quá hạn trả.</p>
                <ul style="background-color: #fee2e2; padding: 15px 30px; border-radius: 8px; border: 1px solid #fca5a5;">
                  <li>Ngày đến hạn: <strong>${dueDate.toLocaleDateString('vi-VN')}</strong></li>
                  <li>Số ngày quá hạn: <strong style="color: #dc2626;">${overdueDays} ngày</strong></li>
                  <li>Phí phạt dự kiến tạm tính: <strong style="color: #dc2626;">${estimatedFine.toLocaleString()} VNĐ</strong></li>
                </ul>
                <p>Hệ thống phạt tự động tính <strong>5.000 VNĐ cho mỗi ngày trễ</strong> và tài khoản của bạn hiện <strong>đang bị tạm khóa tính năng mượn sách mới</strong>.</p>
                <p>Vui lòng mang sách đến hoàn trả ngay lập tức để mở lại thẻ và không bị cộng dồn thêm phí phạt.</p>
                <br/>
                <p>Trân trọng,<br/>Ban Quản Trị Thư Viện</p>
              </div>
            `
          };
        }

        if (mailOptions) {
          try {
            await transporter.sendMail(mailOptions);
            console.log(`📧 Đã gửi email cho ${record.user_id.email} (Sách: ${record.book_id.title} - ${daysDiff < 0 ? 'Quá hạn' : 'Nhắc nhở'})`);
          } catch (mailError) {
            console.error(`❌ Lỗi gửi email cho ${record.user_id.email}:`, mailError.message);
          }
        }
      }
    } catch (error) {
      console.error('❌ Lỗi khi chạy CronJob quét phiếu mượn:', error);
    }
  });
};

// KẾT XUẤT CẢ 2 HÀM ĐỂ BÊN NGOÀI SỬ DỤNG
module.exports = { startCronJobs, sendBorrowConfirmationEmail };