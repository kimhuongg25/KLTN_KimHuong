import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ManageUsersPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      alert('Truy cập bị từ chối. Chỉ dành cho Quản trị viên!');
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng', error);
    }
  };

  // 1. HÀM XỬ LÝ KHÓA / MỞ KHÓA TÀI KHOẢN
  const handleToggleLock = async (id, name, currentStatus) => {
    const actionText = currentStatus === 'locked' ? 'MỞ KHÓA' : 'KHÓA';
    if (window.confirm(`⚠️ Xác nhận: Bạn muốn ${actionText} tài khoản của độc giả "${name}"?`)) {
      try {
        const res = await api.put(`/users/${id}/lock`);
        alert(res.data.message);
        fetchUsers(); // Tải lại danh sách sau khi cập nhật
      } catch (error) {
        alert(error.response?.data?.message || 'Lỗi khi thay đổi trạng thái');
      }
    }
  };

  // 2. HÀM XỬ LÝ CẤP QUYỀN / THU HỒI QUYỀN ADMIN
  const handleChangeRole = async (id, name, currentRole) => {
    const actionText = currentRole === 'admin' ? 'THU HỒI quyền Quản trị của' : 'CẤP quyền Quản trị cho';
    if (window.confirm(`👑 Xác nhận: Bạn muốn ${actionText} "${name}"?`)) {
      try {
        const res = await api.put(`/users/${id}/role`);
        alert(res.data.message);
        fetchUsers(); 
      } catch (error) {
        alert(error.response?.data?.message || 'Lỗi khi thay đổi quyền');
      }
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '30px 20px', fontFamily: "'Times New Roman', Times, serif" }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: '#111827', fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0' }}>👥 Quản Lý Độc Giả</h2>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>Theo dõi trạng thái, cấp quyền và quản lý truy cập hệ thống.</p>
          </div>
          <Link to="/admin" style={{ textDecoration: 'none', backgroundColor: '#ffffff', color: '#4b5563', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', transition: '0.2s' }}>
            <span style={{ marginRight: '8px' }}>⬅</span> Về Bảng Điều Khiển
          </Link>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: '#374151', fontSize: '14px', fontWeight: 'bold' }}>Tên Hiển Thị</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: '#374151', fontSize: '14px', fontWeight: 'bold' }}>Email / SĐT</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', color: '#374151', fontSize: '14px', fontWeight: 'bold' }}>Trạng Thái</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', color: '#374151', fontSize: '14px', fontWeight: 'bold' }}>Phân Quyền</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', color: '#374151', fontSize: '14px', fontWeight: 'bold' }}>Hành Động</th>
                </tr>
              </thead>
              <tbody style={{ divideY: '1px solid #e5e7eb' }}>
                {users.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '16px' }}>Chưa có độc giả nào trên hệ thống.</td></tr>
                ) : (
                  users.map(u => {
                    const displayName = u.fullName || u.username; // Hỗ trợ cả dữ liệu cũ và mới
                    const isLocked = u.status === 'locked';
                    
                    return (
                      <tr key={u._id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: isLocked ? '#fafafa' : '#fff', opacity: isLocked ? 0.8 : 1 }}>
                        
                        {/* CỘT 1: THÔNG TIN TÊN & NGÀY TẠO */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ color: '#111827', fontWeight: 'bold', fontSize: '16px' }}>{displayName}</div>
                          <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>Tham gia: {new Date(u.createdAt).toLocaleDateString('vi-VN')}</div>
                        </td>

                        {/* CỘT 2: LIÊN HỆ */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ color: '#4b5563', fontSize: '15px' }}>{u.email}</div>
                          {u.phone && <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>📞 {u.phone}</div>}
                        </td>

                        {/* CỘT 3: TRẠNG THÁI (BADGE MÀU) */}
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <span style={{ 
                            backgroundColor: isLocked ? '#fee2e2' : '#d1fae5', 
                            color: isLocked ? '#dc2626' : '#059669', 
                            padding: '6px 12px', 
                            borderRadius: '20px', 
                            fontSize: '13px', 
                            fontWeight: 'bold',
                            display: 'inline-block'
                          }}>
                            {isLocked ? '🔒 Đã Khóa' : '✅ Hoạt Động'}
                          </span>
                        </td>

                        {/* CỘT 4: PHÂN QUYỀN */}
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <span style={{ 
                            backgroundColor: u.role === 'admin' ? '#e0e7ff' : '#f3f4f6', 
                            color: u.role === 'admin' ? '#4f46e5' : '#4b5563', 
                            padding: '6px 12px', 
                            borderRadius: '6px', 
                            fontSize: '13px', 
                            fontWeight: 'bold' 
                          }}>
                            {u.role === 'admin' ? '👑 Quản Trị Viên' : 'Độc Giả'}
                          </span>
                        </td>

                        {/* CỘT 5: CÁC NÚT HÀNH ĐỘNG */}
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            {/* Nút Khóa / Mở Khóa */}
                            <button 
                              onClick={() => handleToggleLock(u._id, displayName, u.status)} 
                              style={{ 
                                padding: '8px 12px', 
                                backgroundColor: isLocked ? '#10b981' : '#ef4444', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '6px', 
                                cursor: 'pointer', 
                                fontWeight: 'bold',
                                fontFamily: "'Times New Roman', Times, serif"
                              }}
                            >
                              {isLocked ? 'Mở Khóa' : 'Khóa'}
                            </button>

                            {/* Nút Đổi Quyền */}
                            <button 
                              onClick={() => handleChangeRole(u._id, displayName, u.role)} 
                              style={{ 
                                padding: '8px 12px', 
                                backgroundColor: '#4f46e5', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '6px', 
                                cursor: 'pointer', 
                                fontWeight: 'bold',
                                fontFamily: "'Times New Roman', Times, serif"
                              }}
                            >
                              Cấp Quyền
                            </button>
                          </div>
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

export default ManageUsersPage;