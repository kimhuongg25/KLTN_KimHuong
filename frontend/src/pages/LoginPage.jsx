import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import api from '../services/api';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // State điều khiển con mắt
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Gọi API đăng nhập (đảm bảo đường dẫn này khớp với route của bạn)
      const res = await api.post('/users/login', formData);
      
      // Lưu thông tin vào AuthContext và LocalStorage
      login(res.data);
      
      // Phân quyền điều hướng
      if (res.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác!');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    marginTop: '6px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: '#f9fafb',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease-in-out',
    fontFamily: "'Times New Roman', Times, serif"
  };
  const labelStyle = { fontWeight: '600', color: '#374151', fontSize: '14px' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', padding: '20px', fontFamily: "'Times New Roman', Times, serif" }}>
      <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '450px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#1976d2', fontSize: '32px', fontWeight: '800', margin: '0 0 10px 0' }}>👋 Chào Mừng Trở Lại</h2>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>Đăng nhập vào hệ thống Thư viện thông minh</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* EMAIL */}
          <div>
            <label style={labelStyle}>Email đăng nhập:</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              placeholder="Nhập email của bạn..." 
              style={inputStyle} 
            />
          </div>

          {/* MẬT KHẨU */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelStyle}>Mật khẩu:</label>
              {/* Bạn có thể gắn thẻ Link quên mật khẩu vào đây sau này */}
              <span style={{ fontSize: '13px', color: '#1976d2', cursor: 'pointer', fontWeight: '600' }}>Quên mật khẩu?</span>
            </div>
            
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                placeholder="Nhập mật khẩu..." 
                style={{ ...inputStyle, paddingRight: '40px' }} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <HiOutlineEyeOff size={20} color="#6b7280" /> : <HiOutlineEye size={20} color="#6b7280" />}
              </button>
            </div>
          </div>

          {/* NÚT SUBMIT */}
          <div style={{ marginTop: '10px' }}>
            <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s', boxShadow: '0 4px 6px rgba(25, 118, 210, 0.2)' }}>
              {isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '15px' }}>
            Chưa có tài khoản thư viện? <Link to="/register" style={{ color: '#10b981', fontWeight: 'bold', textDecoration: 'none' }}>Đăng ký ngay</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;