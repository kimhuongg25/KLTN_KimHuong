import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ManageReviewsPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  
  // 1. STATE ĐIỀU KHIỂN BỘ LỌC
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      alert('Truy cập bị từ chối. Chỉ dành cho Quản trị viên!');
      navigate('/');
      return;
    }
    fetchReviews();
  }, [user, navigate]);

  const fetchReviews = async () => {
    try {
      // Giữ nguyên đường dẫn API hiện tại của bạn
      const res = await api.get('/reviews/admin/all'); 
      setReviews(res.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách đánh giá', error);
    }
  };

  // 2. HÀM XỬ LÝ ẨN / HIỆN BÌNH LUẬN
  const handleToggleVisibility = async (id, currentStatus) => {
    const actionText = currentStatus === 'hidden' ? 'HIỂN THỊ LẠI' : 'ẨN';
    if (window.confirm(`⚠️ Bạn có chắc chắn muốn ${actionText} đánh giá này trên hệ thống?`)) {
      try {
        await api.put(`/reviews/${id}/toggle-visibility`);
        alert(`Đã ${actionText.toLowerCase()} đánh giá thành công!`);
        fetchReviews(); // Tải lại danh sách
      } catch (error) {
        alert(error.response?.data?.message || 'Lỗi khi thay đổi trạng thái đánh giá');
      }
    }
  };

  // 3. LOGIC LỌC DỮ LIỆU TRƯỚC KHI HIỂN THỊ
  const filteredReviews = reviews.filter(rev => {
    if (filter === 'all') return true;
    if (filter === 'visible') return rev.status !== 'hidden';
    if (filter === 'hidden') return rev.status === 'hidden';
    if (filter === '5star') return rev.rating === 5;
    if (filter === 'bad') return rev.rating <= 3;
    return true;
  });

  if (!user || user.role !== 'admin') return null;

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '30px 20px', fontFamily: "'Times New Roman', Times, serif" }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 style={{ color: '#111827', fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0' }}>💬 Kiểm Duyệt Đánh Giá</h2>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>Quản lý nội dung bình luận để duy trì môi trường thư viện lành mạnh.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {/* THÊM THANH BỘ LỌC VÀO GIAO DIỆN */}
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif", cursor: 'pointer', fontSize: '15px' }}
            >
              <option value="all">Tất cả đánh giá</option>
              <option value="visible">Đang hiển thị</option>
              <option value="hidden">Đã bị ẩn</option>
              <option value="5star">(5 Sao)</option>
              <option value="bad">(1 - 3 Sao)</option>
            </select>

            <Link to="/admin" style={{ textDecoration: 'none', backgroundColor: '#ffffff', color: '#4b5563', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', transition: '0.2s' }}>
              <span style={{ marginRight: '8px' }}>⬅</span> Về Bảng Điều Khiển
            </Link>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1050px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: '#374151', fontSize: '14px', fontWeight: 'bold' }}>Sách Được Đánh Giá</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: '#374151', fontSize: '14px', fontWeight: 'bold' }}>Người Đăng</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', color: '#374151', fontSize: '14px', fontWeight: 'bold' }}>Số Sao</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: '#374151', fontSize: '14px', fontWeight: 'bold' }}>Nội Dung</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', color: '#374151', fontSize: '14px', fontWeight: 'bold' }}>Trạng Thái</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', color: '#374151', fontSize: '14px', fontWeight: 'bold' }}>Hành Động</th>
                </tr>
              </thead>
              <tbody style={{ divideY: '1px solid #e5e7eb' }}>
                {filteredReviews.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '16px' }}>Không có bài đánh giá nào phù hợp với bộ lọc.</td></tr>
                ) : (
                  filteredReviews.map(rev => {
                    const isHidden = rev.status === 'hidden';
                    return (
                      <tr key={rev._id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: isHidden ? '#fafafa' : '#fff', opacity: isHidden ? 0.7 : 1 }}>
                        
                        <td style={{ padding: '16px 20px', color: '#111827', fontWeight: 'bold', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rev.book_id?.title || 'Sách đã bị xóa'}
                        </td>
                        
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ color: '#111827', fontWeight: 'bold' }}>{rev.user_id?.fullName || rev.user_id?.username || 'Khách'}</div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</div>
                        </td>
                        
                        <td style={{ padding: '16px 20px', textAlign: 'center', color: '#f59e0b', fontSize: '16px' }}>
                          {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                        </td>
                        
                        <td style={{ padding: '16px 20px', color: '#4b5563', maxWidth: '300px', lineHeight: '1.5', fontStyle: isHidden ? 'italic' : 'normal' }}>
                          {rev.comment}
                        </td>

                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <span style={{ 
                            backgroundColor: isHidden ? '#fee2e2' : '#d1fae5', 
                            color: isHidden ? '#dc2626' : '#059669', 
                            padding: '6px 12px', 
                            borderRadius: '20px', 
                            fontSize: '13px', 
                            fontWeight: 'bold',
                            display: 'inline-block'
                          }}>
                            {isHidden ? 'Đã Ẩn' : '✅ Hiển Thị'}
                          </span>
                        </td>

                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <button 
                            onClick={() => handleToggleVisibility(rev._id, rev.status)} 
                            style={{ 
                              padding: '8px 16px', 
                              backgroundColor: isHidden ? '#10b981' : '#ef4444', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: 'pointer', 
                              fontWeight: 'bold',
                              fontFamily: "'Times New Roman', Times, serif"
                            }}
                          >
                            {isHidden ? 'Bỏ Ẩn' : 'Ẩn Đi'}
                          </button>
                        </td>
                        
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManageReviewsPage;