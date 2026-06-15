const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');
const User = require('../models/User'); // Đảm bảo bạn có model User

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Lấy các con số thống kê tổng quát
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalBorrows = await BorrowRecord.countDocuments();
    const pendingBorrows = await BorrowRecord.countDocuments({ status: 'pending' });

    // 2. Lọc dữ liệu biểu đồ: 7 ngày gần nhất
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyData = await BorrowRecord.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          // Ép múi giờ Việt Nam để không bị lệch ngày
          _id: { $dateToString: { format: "%d/%m", date: "$createdAt", timezone: "+07:00" } },
          count: { $sum: 1 }
        }
      }
    ]);

    // 3. Xử lý lấp đầy các ngày trống (ví dụ ngày đó không ai mượn thì biểu đồ hiện số 0)
    const chartMap = new Map();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      chartMap.set(dateStr, 0); // Mặc định là 0
    }

    weeklyData.forEach(item => {
      if (chartMap.has(item._id)) {
        chartMap.set(item._id, item.count);
      }
    });

    const finalChartData = Array.from(chartMap, ([date, count]) => ({ date, count }));

    res.status(200).json({
      totalBooks, totalUsers, totalBorrows, pendingBorrows,
      chartData: finalChartData
    });
  } catch (error) {
    console.error("Lỗi lấy dữ liệu Dashboard:", error);
    res.status(500).json({ error: error.message });
  }
};