import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Khối CSS nhúng tạo hiệu ứng Hover */}
      <style>{`
        .nav-link {
          color: #ffffff;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          transition: all 0.2s ease;
          padding: 8px 12px;
          border-radius: 8px;
        }
        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.15);
        }
        .nav-brand {
          font-size: 24px;
          font-weight: 800;
          color: #ffffff;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: -0.02em;
        }
        .btn-logout {
          background-color: #ff4d4f;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }
        .btn-logout:hover {
          background-color: #d9363e;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .btn-login {
          background-color: #ffffff;
          color: #1976d2;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: bold;
          text-decoration: none;
          transition: background-color 0.2s;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .btn-login:hover {
          background-color: #f0f0f0;
        }
        /* THÊM MỚI: Style cho nút Đăng ký */
        .btn-register {
          background-color: transparent;
          color: #ffffff;
          padding: 8px 22px;
          border-radius: 8px;
          font-weight: bold;
          text-decoration: none;
          transition: all 0.2s;
          border: 2px solid #ffffff;
        }
        .btn-register:hover {
          background-color: rgba(255, 255, 255, 0.15);
        }
        .user-badge {
          background-color: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 700;
        }
        .admin-badge {
          background-color: transparent;
          color: #ffc107;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: bold;
          text-decoration: none;
          transition: all 0.2s;
          border: 1px solid #ffc107;
        }
        .admin-badge:hover {
          background-color: #ffc107;
          color: #000;
        }
      `}</style>

      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '0 5%', 
        height: '72px',
        backgroundColor: '#1976d2',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif"
      }}>
        {/* LOGO */}
        <div>
          <Link to="/" className="nav-brand">📚 Smart Library</Link>
        </div>

        {/* CÁC NÚT ĐIỀU HƯỚNG */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/" className="nav-link">Trang Chủ</Link>
          
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="admin-badge">⚡ Quản Trị Admin</Link>
              )}
              
              <Link to="/profile" className="nav-link">Trang Cá Nhân</Link>
              
              <div style={{ height: '24px', width: '1px', backgroundColor: 'rgba(255,255,255,0.3)', margin: '0 8px' }}></div>
              
              <span className="user-badge">👋 Chào, {user.username}</span>
              
              <button onClick={handleLogout} className="btn-logout">
                Đăng Xuất
              </button>
            </>
          ) : (
            // ĐÃ CHỈNH SỬA: Hiển thị cả Đăng nhập và Đăng ký khi chưa có user
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: '10px' }}>
              <Link to="/login" className="btn-login">Đăng Nhập</Link>
              <Link to="/register" className="btn-register">Đăng Ký</Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;