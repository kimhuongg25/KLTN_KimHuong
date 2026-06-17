import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import BookDetailPage from './pages/BookDetailPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import ManageBorrowsPage from './pages/ManageBorrowsPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ManageCategoriesPage from './pages/ManageCategoriesPage';

// Import 2 trang quản lý mới
import ManageUsersPage from './pages/ManageUsersPage'; 
import ManageReviewsPage from './pages/ManageReviewsPage'; 

// 1. IMPORT CHATBOT WIDGET VÀO APP
import ChatbotWidget from './components/ChatbotWidget';

// BỔ SUNG: Import component ScrollToTop
import ScrollToTop from './components/ScrollToTop';
import ManageFinesPage from './pages/ManageFinesPage';
function App() {
  return (
    <Router>
      {/* ĐẶT Ở ĐÂY: Có hiệu lực tự động kéo lên đầu trang cho toàn bộ hệ thống */}
      <ScrollToTop />
      
      <Navbar /> 
      <Routes>
        {/* CÁC ROUTE CỦA NGƯỜI DÙNG */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/book/:id" element={<BookDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* CÁC ROUTE CỦA QUẢN TRỊ VIÊN */}
        <Route path="/admin" element={<AdminDashboardPage />} /> 
        <Route path="/admin/books" element={<AdminPage />} /> 
        <Route path="/admin/borrows" element={<ManageBorrowsPage />} /> 
        
        {/* Route kết nối 2 trang mới */}
        <Route path="/admin/users" element={<ManageUsersPage />} /> 
        <Route path="/admin/reviews" element={<ManageReviewsPage />} />
        
        <Route path="/admin/categories" element={<ManageCategoriesPage />} />
        <Route path="/admin/fines" element={<ManageFinesPage />} />
      </Routes>
      
      {/* 2. ĐẶT CHATBOT Ở ĐÂY (Nằm ngoài Routes để nó luôn hiển thị ở mọi trang) */}
      <ChatbotWidget />
      
    </Router>
  );
}

export default App;