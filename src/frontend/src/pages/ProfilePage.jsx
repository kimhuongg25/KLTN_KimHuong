import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ProfilePage = () => {
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // State hiển thị dữ liệu
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [favorites, setFavorites] = useState([]); 
  const [loading, setLoading] = useState(true);

  // State dùng cho Form cập nhật hồ sơ
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        // 1. Lấy thông tin Profile (Admin và User đều cần)
        const profileRes = await api.get('/users/profile');
        setUsername(profileRes.data.username || '');
        setEmail(profileRes.data.email || '');

        // 🔒 CHỈ GỌI CÁC API DƯỚI ĐÂY NẾU LÀ TÀI KHOẢN ĐỘC GIẢ
        if (user.role === 'user') {
          setFavorites(profileRes.data.favorites || []);

          // 2. Lấy lịch sử mượn sách
          const historyRes = await api.get('/borrows/my-history');
          setBorrowHistory(historyRes.data);

          // 3. Lấy danh sách sách AI gợi ý
          try {
            const recRes = await api.get('/users/recommendations');
            setRecommendations(recRes.data);
          } catch (recError) {
            console.log("Chưa có API gợi ý sách hoặc lỗi AI:", recError);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu cá nhân:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  // Hàm xử lý cập nhật thông tin cá nhân
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const res = await api.put('/users/profile', { username, email, password });
      alert(res.data.message);
      
      if (password) {
        alert("Bạn đã đổi mật khẩu. Vui lòng đăng nhập lại!");
        dispatch({ type: "LOGOUT" });
        navigate('/login');
      } else {
        dispatch({ type: "LOGIN_SUCCESS", payload: { ...user, username: res.data.username, email: res.data.email } });
        setPassword(''); 
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật!');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Chờ cập nhật</span>;
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const renderStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', border: '1px solid #fde68a' }}>⏳ Chờ Duyệt</span>;
      case 'approved': return <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', border: '1px solid #bfdbfe' }}>📚 Đang Mượn</span>;
      case 'returned': return <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', border: '1px solid #a7f3d0' }}>✅ Đã Trả</span>;
      case 'rejected': return <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', border: '1px solid #fecaca' }}>❌ Bị Từ Chối</span>;
      default: return status;
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '18px' }}>
        <div style={{ fontSize: '30px', marginBottom: '15px' }}>⏳</div>
        Đang tải dữ liệu hồ sơ...
      </div>
    </div>
  );

  const inputStyle = { width: '100%', padding: '12px 14px', marginTop: '6px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#f9fafb', fontSize: '15px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s ease-in-out' };
  const labelStyle = { fontWeight: '600', color: '#374151', fontSize: '14px' };

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" }}>
      <style>{`
        .book-card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .book-card-hover:hover { transform: translateY(-6px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05) !important; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* HEADER CHUNG */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: user.role === 'admin' ? '#fef3c7' : '#e0e7ff', color: user.role === 'admin' ? '#d97706' : '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 5px 0', color: '#111827', fontSize: '28px', fontWeight: '800' }}>Hồ Sơ Của {user.username}</h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '15px' }}>
              {user.email} • {user.role === 'admin' ? 'Quản Trị Viên Hệ Thống' : 'Thành viên Smart Library'}
            </p>
          </div>
          {user.role === 'admin' && (
            <button onClick={() => navigate('/admin')} style={{ padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              ⚙️ Về Bảng Điều Khiển
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: user.role === 'admin' ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '30px' }}>
          
          {/* CỘT TRÁI: FORM CẬP NHẬT HỒ SƠ (Ai cũng thấy) */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '30px', maxWidth: user.role === 'admin' ? '600px' : 'none', margin: user.role === 'admin' ? '0 auto' : '0', width: '100%', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚙️</span> Cài Đặt Tài Khoản
            </h3>
            
            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>Tên hiển thị:</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>Địa chỉ Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
              </div>

              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fde047' }}>
                <label style={labelStyle}>Đổi mật khẩu mới (Bỏ trống nếu không đổi):</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu mới..." style={{ ...inputStyle, backgroundColor: '#ffffff' }} />
              </div>

              <button type="submit" disabled={isUpdating} style={{ width: '100%', padding: '14px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: isUpdating ? 'not-allowed' : 'pointer', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.3)' }}>
                {isUpdating ? 'Đang cập nhật...' : '💾 Lưu Thay Đổi'}
              </button>
            </form>
          </div>

          {/* CỘT PHẢI: DANH SÁCH YÊU THÍCH (Chỉ Độc giả mới thấy) */}
          {user.role === 'user' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '30px' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>❤️</span> Sách Đã Yêu Thích
              </h3>
              
              {favorites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#fef2f2', borderRadius: '12px', color: '#991b1b', border: '1px dashed #fca5a5', fontSize: '14px' }}>
                  Bạn chưa thả tim cuốn sách nào. Hãy dạo quanh thư viện và đánh dấu những cuốn bạn tâm đắc nhé!
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
                  {favorites.map((book) => (
                    <div 
                      key={book._id} 
                      className="book-card-hover"
                      onClick={() => navigate(`/book/${book._id}`)}
                      style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                    >
                      <div style={{ height: '180px', backgroundColor: '#f3f4f6' }}>
                        {book.cover_image ? (
                          <img src={book.cover_image} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '12px' }}>Chưa có ảnh</div>
                        )}
                      </div>
                      <div style={{ padding: '10px', flexGrow: 1 }}>
                        <h4 className="line-clamp-2" style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#111827', lineHeight: '1.4' }} title={book.title}>
                          {book.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* LỊCH SỬ MƯỢN SÁCH (Chỉ Độc giả mới thấy) */}
        {user.role === 'user' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '30px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '20px', fontWeight: '700' }}>📚 Lịch sử phiếu mượn</h3>
              <span style={{ backgroundColor: '#f3f4f6', color: '#4b5563', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                Tổng cộng: {borrowHistory.length} phiếu
              </span>
            </div>

            {borrowHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9fafb', borderRadius: '12px', color: '#6b7280', border: '1px dashed #d1d5db' }}>
                Bạn chưa có yêu cầu mượn cuốn sách nào.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '16px 20px', textAlign: 'left', color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Tên Sách</th>
                      <th style={{ padding: '16px 20px', textAlign: 'center', color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Ngày Mượn</th>
                      <th style={{ padding: '16px 20px', textAlign: 'center', color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Hạn Trả</th>
                      <th style={{ padding: '16px 20px', textAlign: 'center', color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Trạng Thái</th>
                      <th style={{ padding: '16px 20px', textAlign: 'center', color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Tiền Phạt</th>
                    </tr>
                  </thead>
                  <tbody style={{ divideY: '1px solid #e5e7eb' }}>
                    {borrowHistory.map((record) => (
                      <tr key={record._id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ color: '#111827', fontWeight: '600', fontSize: '15px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {record.book_id?.title || 'Sách đã bị xóa'}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center', color: '#4b5563', fontSize: '14px' }}>{formatDate(record.borrow_date)}</td>
                        <td style={{ padding: '16px 20px', textAlign: 'center', color: '#4b5563', fontSize: '14px' }}>{formatDate(record.due_date)}</td>
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>{renderStatusBadge(record.status)}</td>
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                           <span style={{ color: record.fine?.amount > 0 ? '#dc2626' : '#9ca3af', fontWeight: record.fine?.amount > 0 ? '700' : '400' }}>
                            {record.fine?.amount > 0 ? `${record.fine.amount.toLocaleString()} đ` : '---'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* AI GỢI Ý SÁCH (Chỉ Độc giả mới thấy) */}
        {user.role === 'user' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '30px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✨</span> Gợi Ý Dành Riêng Cho Bạn
            </h3>
            
            {recommendations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#f0fdf4', borderRadius: '12px', color: '#166534', border: '1px solid #bbf7d0', fontSize: '15px' }}>
                Hệ thống AI đang học hỏi sở thích của bạn...
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                {recommendations.map((rec) => {
                  const book = rec.book_id;
                  if (!book) return null; 
                  return (
                    <div key={rec._id} className="book-card-hover" onClick={() => navigate(`/book/${book._id}`)} style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ height: '240px', backgroundColor: '#f3f4f6', position: 'relative' }}>
                        {book.cover_image ? <img src={book.cover_image} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>Chưa có ảnh</div>}
                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: '#10b981', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                          Độ phù hợp: {Math.round(rec.score * 100)}%
                        </div>
                      </div>
                      <div style={{ padding: '16px', flexGrow: 1 }}>
                        <h4 className="line-clamp-2" style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#111827' }}>{book.title}</h4>
                        <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{book.author}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;