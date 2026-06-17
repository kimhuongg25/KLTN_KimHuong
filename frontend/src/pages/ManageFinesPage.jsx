import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ManageFinesPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [fines, setFines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('unpaid'); // Mặc định chỉ hiện Chưa thanh toán

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchFines();
  }, [user, navigate]);

  const fetchFines = async () => {
    try {
      const res = await api.get('/borrows/admin/fines');
      setFines(res.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách phạt:', error);
    }
  };

  // --- LỌC THEO HỌ TÊN, EMAIL VÀ TRẠNG THÁI ---
  const filteredFines = fines.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = 
      (record.user_id?.fullName || '').toLowerCase().includes(searchLower) ||
      (record.user_id?.email || '').toLowerCase().includes(searchLower) ||
      (record.book_id?.title || '').toLowerCase().includes(searchLower);
      
    const matchStatus = filterStatus === 'all' || record.fine?.status === filterStatus;
    
    return matchSearch && matchStatus;
  });

  // --- XỬ LÝ NÚT THANH TOÁN ---
  const handlePayFine = async (recordId) => {
    if (!window.confirm("Xác nhận độc giả đã nộp đủ tiền phạt cho phiếu này?")) return;
    
    try {
      const res = await api.put(`/borrows/admin/fines/${recordId}/pay`);
      alert(res.data.message); // Hiển thị thông báo (Có mở khóa thẻ hay không)
      fetchFines(); // Cập nhật lại bảng
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi thanh toán');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '30px 20px', fontFamily: "'Times New Roman', Times, serif" }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: '#111827', fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0' }}>💰 Quản Lý Thu Phạt</h2>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>Xử lý nợ đọng và mở khóa tài khoản độc giả.</p>
          </div>
          <Link to="/admin" style={{ textDecoration: 'none', backgroundColor: '#ffffff', color: '#4b5563', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>⬅</span> Về Bảng Điều Khiển
          </Link>
        </div>

        {/* BỘ LỌC TÌM KIẾM */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ flex: 2 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>🔍 Tra cứu nhanh</label>
            <input 
              type="text" 
              placeholder="Nhập Họ tên, Email độc giả hoặc Tên sách..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', fontFamily: "'Times New Roman', Times, serif" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>🏷️ Trạng thái thanh toán</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', fontFamily: "'Times New Roman', Times, serif" }}
            >
              <option value="unpaid">❌ Chưa thanh toán (Nợ)</option>
              <option value="paid">✅ Đã thanh toán</option>
              <option value="all">Tất cả</option>
            </select>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '16px', color: '#374151' }}>Độc Giả</th>
                <th style={{ padding: '16px', color: '#374151' }}>Chi Tiết Phạt</th>
                <th style={{ padding: '16px', textAlign: 'center', color: '#374151' }}>Tiền Phạt</th>
                <th style={{ padding: '16px', textAlign: 'center', color: '#374151' }}>Trạng Thái</th>
                <th style={{ padding: '16px', textAlign: 'center', color: '#374151' }}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filteredFines.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Không tìm thấy khoản phạt nào.</td></tr>
              ) : (
                filteredFines.map(record => (
                  <tr key={record._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '16px' }}>{record.user_id?.fullName || record.user_id?.username}</div>
                      <div style={{ color: '#6b7280', fontSize: '14px' }}>{record.user_id?.email}</div>
                      {record.user_id?.status === 'locked' && <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '12px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Thẻ đang khóa</span>}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 'bold', color: '#4f46e5' }}>📘 {record.book_id?.title}</div>
                      <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px', fontStyle: 'italic' }}>Lý do: {record.fine?.reason}</div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: '#dc2626', fontSize: '16px' }}>
                      {record.fine?.amount.toLocaleString()} đ
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {record.fine?.status === 'paid' 
                        ? <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px' }}>Đã thu tiền</span>
                        : <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px' }}>Chưa nộp</span>
                      }
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {record.fine?.status === 'unpaid' ? (
                        <button 
                          onClick={() => handlePayFine(record._id)}
                          style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif" }}
                        >
                          Xác nhận Thu Tiền
                        </button>
                      ) : (
                        <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Hoàn tất</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default ManageFinesPage;