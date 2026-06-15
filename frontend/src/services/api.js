import axios from 'axios';

// Khởi tạo một đối tượng axios với đường dẫn gốc trỏ về Backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

// Hàm "gác cổng": Tự động đính kèm Token vào mỗi yêu cầu gửi đi
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;