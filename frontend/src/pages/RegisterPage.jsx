import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
// 1. IMPORT THƯ VIỆN ICON VÀO ĐÂY
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const RegisterPage = () => {
  const navigate = useNavigate();

  // STATE LƯU TRỮ TOÀN BỘ THÔNG TIN ĐĂNG KÝ
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  // STATE ĐIỀU KHIỂN ẨN/HIỆN MẬT KHẨU
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hàm xử lý khi gõ vào ô input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Kiểm tra mật khẩu khớp nhau
    if (formData.password !== formData.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp!');
    }

    setIsLoading(true);
    try {
      await api.post('/users/register', formData);
      alert('🎉 Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      // Thêm dòng console.log này để in toàn bộ lỗi ra màn hình F12
      console.log("CHI TIẾT LỖI TỪ BACKEND:", err.response); 
      
      // Bổ sung thêm err.response?.data?.error để bắt được cả những lỗi do hệ thống ném ra
      setError(err.response?.data?.message || err.response?.data?.error || 'Có lỗi xảy ra khi đăng ký!');
    } finally {
      setIsLoading(false);
    }
  };

  // --- STYLE TÁI SỬ DỤNG ---
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', padding: '40px 20px', fontFamily: "'Times New Roman', Times, serif" }}>
      <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '600px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#1976d2', fontSize: '32px', fontWeight: '800', margin: '0 0 10px 0' }}>Đăng Ký Tài Khoản</h2>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>Điền thông tin dưới đây để tham gia hệ thống</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* HỌ VÀ TÊN */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Họ và tên:</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Nhập họ và tên đầy đủ..." style={inputStyle} />
          </div>

          {/* EMAIL */}
          <div>
            <label style={labelStyle}>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="example@email.com" style={inputStyle} />
          </div>

          {/* SỐ ĐIỆN THOẠI */}
          <div>
            <label style={labelStyle}>Số điện thoại:</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="09xxxxxxxxx" style={inputStyle} />
          </div>

          {/* NGÀY SINH */}
          <div>
            <label style={labelStyle}>Ngày sinh:</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} required style={inputStyle} />
          </div>

          {/* GIỚI TÍNH */}
          <div>
            <label style={labelStyle}>Giới tính:</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required style={inputStyle}>
              <option value="">-- Chọn giới tính --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          {/* ĐỊA CHỈ */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Địa chỉ hiện tại:</label>
            <textarea name="address" value={formData.address} onChange={handleChange} required placeholder="Số nhà, Tên đường, Phường/Xã..." style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
          </div>

          {/* MẬT KHẨU CÓ ICON */}
          <div>
            <label style={labelStyle}>Mật khẩu:</label>
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
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {/* 2. LOGIC ĐỔI ICON SVG DỰA VÀO STATE */}
                {showPassword ? <HiOutlineEyeOff size={20} color="#6b7280" /> : <HiOutlineEye size={20} color="#6b7280" />}
              </button>
            </div>
          </div>

          {/* XÁC NHẬN MẬT KHẨU CÓ ICON */}
          <div>
            <label style={labelStyle}>Xác nhận mật khẩu:</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required 
                placeholder="Nhập lại mật khẩu..." 
                style={{ ...inputStyle, paddingRight: '40px' }} 
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {/* 2. LOGIC ĐỔI ICON SVG DỰA VÀO STATE */}
                {showConfirmPassword ? <HiOutlineEyeOff size={20} color="#6b7280" /> : <HiOutlineEye size={20} color="#6b7280" />}
              </button>
            </div>
          </div>

          {/* NÚT SUBMIT */}
          <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
            <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s' }}>
              {isLoading ? 'Đang xử lý...' : 'Xác Nhận Đăng Ký  '}
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '15px' }}>
            Đã có tài khoản thư viện? <Link to="/login" style={{ color: '#1976d2', fontWeight: 'bold', textDecoration: 'none' }}>Đăng nhập ngay</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;