import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from 'recharts';

const AdminDashboardPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalBorrows: 0,
    pendingBorrows: 0
  });

  const [dailyData, setDailyData] = useState([]);
  const [timeRange, setTimeRange] = useState('7days'); 

  const [monthlyStats, setMonthlyStats] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      alert('Truy cập bị từ chối!');
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') fetchMonthlyStats();
  }, [user, selectedYear]);

  useEffect(() => {
    if (user?.role === 'admin') fetchDailyStats();
  }, [user, timeRange]);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard');
      setStats(res.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu tổng quan:", error);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const res = await api.get(`/borrows/admin/stats?year=${selectedYear}`);
      setMonthlyStats(res.data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu theo tháng:", error);
    }
  };

  const fetchDailyStats = async () => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    if (timeRange === '7days') {
      start.setDate(today.getDate() - 6);
    } else if (timeRange === 'last_week') {
      const dayOfWeek = today.getDay(); 
      const daysToLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      end.setDate(today.getDate() - daysToLastMonday - 1); 
      start = new Date(end);
      start.setDate(end.getDate() - 6); 
    } else if (timeRange === 'this_month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1); 
    } else if (timeRange === 'last_month') {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1); 
      end = new Date(today.getFullYear(), today.getMonth(), 0); 
    }

    try {
      const res = await api.get(`/borrows/admin/stats/daily?startDate=${start.toISOString()}&endDate=${end.toISOString()}`);
      setDailyData(res.data);
    } catch (error) {
      console.error("Lỗi tải biểu đồ theo ngày:", error);
    }
  };

  if (!user || user.role !== 'admin') return null;

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '30px 20px', fontFamily: "'Inter', sans-serif" }}>      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Lời chào */}
        <div style={{ marginBottom: '30px', fontFamily: "'Times New Roman', Times, serif" }}>
          <h2 style={{ color: '#111827', fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0' }}>
            👋 Chào mừng trở lại, {user.username}!
          </h2>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '15px' }}>Dưới đây là tổng quan tình hình hoạt động của thư viện.</p>
        </div>

        {/* 4 Thẻ thống kê */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#e0e7ff', padding: '16px', borderRadius: '12px', marginRight: '16px', fontSize: '24px' }}>📦</div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px', fontWeight: '600' }}>TỔNG SỐ SÁCH</p>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '24px', fontWeight: '700' }}>{stats.totalBooks}</h3>
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#d1fae5', padding: '16px', borderRadius: '12px', marginRight: '16px', fontSize: '24px' }}>👥</div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px', fontWeight: '600' }}>ĐỘC GIẢ</p>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '24px', fontWeight: '700' }}>{stats.totalUsers}</h3>
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#fef3c7', padding: '16px', borderRadius: '12px', marginRight: '16px', fontSize: '24px' }}>📋</div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px', fontWeight: '600' }}>LƯỢT MƯỢN</p>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '24px', fontWeight: '700' }}>{stats.totalBorrows}</h3>
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#fee2e2', padding: '16px', borderRadius: '12px', marginRight: '16px', fontSize: '24px' }}>⏳</div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px', fontWeight: '600' }}>CHỜ DUYỆT</p>
              <h3 style={{ margin: 0, color: '#dc2626', fontSize: '24px', fontWeight: '700' }}>{stats.pendingBorrows}</h3>
            </div>
          </div>
        </div>

        {/* --- BIỂU ĐỒ 1: THEO TUẦN / THÁNG --- */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#111827', fontSize: '18px' }}>📈 Thống kê lượt mượn sách chi tiết</h3>
            
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', cursor: 'pointer', fontWeight: '600', backgroundColor: '#f9fafb' }}
            >
              <option value="7days">7 ngày qua</option>
              <option value="last_week">Tuần trước</option>
              <option value="this_month">Tháng này</option>
              <option value="last_month">Tháng trước</option>
            </select>
          </div>

          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} labelStyle={{ fontWeight: 'bold', color: '#111827' }} />
                <Area type="monotone" dataKey="count" name="Lượt mượn" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- BIỂU ĐỒ 2: BÁO CÁO CẢ NĂM --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#111827', fontSize: '20px' }}>📅 Báo Cáo Hoạt Động Cả Năm</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>Chọn Năm:</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontWeight: '600', cursor: 'pointer' }}
            >
              {years.map(year => (
                <option key={year} value={year}>Năm {year}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '40px' }}>
          {/* Cột 1 */}
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <h4 style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px' }}>📉 Tần suất Mượn / Trả sách</h4>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="total" name="Lượt Mượn" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="returned" name="Đã Trả" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cột 2 */}
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <h4 style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '16px' }}>💰 Doanh thu tiền phạt (VNĐ)</h4>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyStats} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <Tooltip formatter={(value) => `${value.toLocaleString()} đ`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="revenue" name="Tổng tiền phạt" stroke="#ef4444" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* --- MENU PHÍM TẮT QUẢN LÝ --- */}
        <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '20px' }}>🛠️ Quản Lý Hệ Thống</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          
          <Link to="/admin/books" style={{ textDecoration: 'none', backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', transition: '0.2s', display: 'block', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '30px', marginBottom: '10px' }}>📦</div>
            <h4 style={{ margin: '0 0 8px 0', color: '#111827' }}>Kho Sách</h4>
            <span style={{ color: '#4f46e5', fontWeight: '600', fontSize: '14px' }}>Truy cập ➔</span>
          </Link>

          <Link to="/admin/categories" style={{ textDecoration: 'none', backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', transition: '0.2s', display: 'block', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '30px', marginBottom: '10px' }}>🏷️</div>
            <h4 style={{ margin: '0 0 8px 0', color: '#111827' }}>Danh Mục Sách</h4>
            <span style={{ color: '#8b5cf6', fontWeight: '600', fontSize: '14px' }}>Truy cập ➔</span>
          </Link>

          <Link to="/admin/borrows" style={{ textDecoration: 'none', backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', transition: '0.2s', display: 'block', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '30px', marginBottom: '10px' }}>📋</div>
            <h4 style={{ margin: '0 0 8px 0', color: '#111827' }}>Phiếu Mượn</h4>
            <span style={{ color: '#10b981', fontWeight: '600', fontSize: '14px' }}>Truy cập ➔</span>
          </Link>

          {/* MỚI: THE BUTTON FOR FINES MANAGEMENT */}
          <Link to="/admin/fines" style={{ textDecoration: 'none', backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', transition: '0.2s', display: 'block', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '30px', marginBottom: '10px' }}>💰</div>
            <h4 style={{ margin: '0 0 8px 0', color: '#111827' }}>Quản Lý Thu Phạt</h4>
            <span style={{ color: '#ec4899', fontWeight: '600', fontSize: '14px' }}>Truy cập ➔</span>
          </Link>

          <Link to="/admin/users" style={{ textDecoration: 'none', backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', transition: '0.2s', display: 'block', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '30px', marginBottom: '10px' }}>👥</div>
            <h4 style={{ margin: '0 0 8px 0', color: '#111827' }}>Người Dùng</h4>
            <span style={{ color: '#f59e0b', fontWeight: '600', fontSize: '14px' }}>Truy cập ➔</span>
          </Link>

          <Link to="/admin/reviews" style={{ textDecoration: 'none', backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', transition: '0.2s', display: 'block', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '30px', marginBottom: '10px' }}>💬</div>
            <h4 style={{ margin: '0 0 8px 0', color: '#111827' }}>Đánh Giá</h4>
            <span style={{ color: '#ef4444', fontWeight: '600', fontSize: '14px' }}>Truy cập ➔</span>
          </Link>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;