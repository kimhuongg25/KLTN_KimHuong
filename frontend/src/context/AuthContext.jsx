import { createContext, useState } from 'react';

// Tạo Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // SỬA: Đổi từ localStorage sang sessionStorage
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Hàm xử lý khi đăng nhập thành công
  const login = (userData) => {
    setUser(userData);
    // SỬA: Lưu vào sessionStorage
    sessionStorage.setItem('user', JSON.stringify(userData)); 
    sessionStorage.setItem('token', userData.token); 
  };

  // Hàm xử lý đăng xuất
  const logout = () => {
    setUser(null);
    // SỬA: Xóa khỏi sessionStorage
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};