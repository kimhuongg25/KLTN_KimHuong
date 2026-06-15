import { createContext, useState } from 'react';

// Tạo Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Lấy dữ liệu user từ bộ nhớ trình duyệt (nếu đã đăng nhập từ trước)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Hàm xử lý khi đăng nhập thành công
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Lưu tên, role
    localStorage.setItem('token', userData.token); // Lưu chìa khóa token
  };

  // Hàm xử lý đăng xuất
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};