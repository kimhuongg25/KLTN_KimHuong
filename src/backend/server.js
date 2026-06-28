require('dotenv').config();
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Thêm dòng này: Import cron service
const { startCronJobs } = require('./services/cronService');

// Để nó vẫn gọi được hàm như bình thường:
startCronJobs();
// Khai báo các Routes
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowRoutes = require('./routes/borrowRoutes');

const categoryRoutes = require('./routes/categoryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối Cơ sở dữ liệu
connectDB();

// Thêm dòng này: Kích hoạt Cron Job chạy ngầm sau khi đã kết nối DB thành công
startCronJobs(); 

// Định tuyến API
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrows', borrowRoutes);

app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.use('/api/chatbot', chatbotRoutes);

app.get('/', (req, res) => {
  res.send('API Thư viện thông minh đang hoạt động...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server chạy tại: http://localhost:${PORT}`);
});