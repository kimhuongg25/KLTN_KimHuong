import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  
  // 1. THÊM STATE ĐỂ LƯU DANH MỤC
  const [categories, setCategories] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  // 2. ĐỔI STATE TỪ GENRE SANG CATEGORY ID
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    // 3. GỌI CÙNG LÚC 2 API: SÁCH VÀ DANH MỤC
    const fetchData = async () => {
      try {
        const [booksRes, categoriesRes] = await Promise.all([
          api.get('/books'),
          api.get('/categories')
        ]);
        setBooks(booksRes.data);
        setCategories(categoriesRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 4. LOGIC LỌC SÁCH THÔNG MINH (Lọc theo category_id từ Database)
  const filteredBooks = books.filter(book => {
    const matchSearch = (book.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         book.author?.toLowerCase().includes(searchTerm.toLowerCase()));
                         
    // Kiểm tra id của danh mục (Hỗ trợ cả trường hợp populate trả về object hoặc string)
    const bookCatId = book.category_id?._id || book.category_id;
    const matchCategory = selectedCategory === '' || bookCatId === selectedCategory;
    
    return matchSearch && matchCategory;
  });

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" }}>
      <style>{`
        .book-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .book-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 20px -5px rgba(0,0,0,0.15), 0 8px 10px -5px rgba(0,0,0,0.04) !important;
        }
        .btn-detail {
          transition: background-color 0.2s ease, transform 0.1s ease;
        }
        .btn-detail:hover {
          background-color: #4338ca !important;
        }
        .btn-detail:active {
          transform: scale(0.96);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;  
          overflow: hidden;
        }
        .search-input:focus, .genre-select:focus {
          border-color: #4f46e5 !important;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
          outline: none;
        }
      `}</style>

      {/* HERO BANNER */}
      <div style={{ backgroundColor: '#111827', color: 'white', padding: '60px 20px', textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 15px 0', letterSpacing: '-0.02em' }}>
          Khám Phá <span style={{ color: '#818cf8' }}>Tri Thức</span>
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '18px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.5' }}>
          Hệ thống thư viện thông minh. Tìm kiếm, tra cứu và mượn sách dễ dàng chỉ với vài thao tác.
        </p>
      </div>

      <div style={{ padding: '0 20px 60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* THANH TÌM KIẾM VÀ LỌC */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap', border: '1px solid #e5e7eb' }}>
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
              <input 
                type="text" 
                className="search-input"
                placeholder="Tìm kiếm theo Tên sách hoặc Tác giả..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '12px 15px 12px 40px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', boxSizing: 'border-box', transition: 'all 0.2s' }}
              />
            </div>
          </div>
          <div style={{ flex: '0 0 200px' }}>
            {/* 5. CẬP NHẬT Ô SELECT LẤY DATA TỪ BẢNG CATEGORIES */}
            <select 
              className="genre-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', cursor: 'pointer', backgroundColor: 'white', boxSizing: 'border-box', transition: 'all 0.2s' }}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.category_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', color: '#1f2937', margin: 0, fontWeight: '700' }}>
            {searchTerm || selectedCategory !== '' ? 'Kết Quả Tìm Kiếm' : '📚 Sách Mới Cập Nhật'}
          </h2>
          <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Tìm thấy {filteredBooks.length} cuốn</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#6b7280', fontSize: '18px' }}>
            <div style={{ fontSize: '30px', marginBottom: '15px' }}>⏳</div>
            Đang tải dữ liệu sách...
          </div>
        ) : filteredBooks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: 'white', borderRadius: '12px', color: '#6b7280', border: '1px dashed #d1d5db' }}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>🕵️‍♂️</div>
            <p style={{ fontSize: '16px', margin: 0 }}>Không tìm thấy cuốn sách nào phù hợp với yêu cầu của bạn.</p>
            <button onClick={() => {setSearchTerm(''); setSelectedCategory('');}} style={{ marginTop: '15px', padding: '8px 16px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', color: '#4b5563', fontWeight: '600' }}>Xóa bộ lọc</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '25px' }}>
            {filteredBooks.map((book) => (
              <div 
                key={book._id} 
                className="book-card"
                style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' }}
              >
                <div 
                  onClick={() => navigate(`/book/${book._id}`)}
                  style={{ cursor: 'pointer', height: '320px', backgroundColor: '#f9fafb', position: 'relative' }}
                >
                  {book.cover_image ? (
                    <img src={book.cover_image} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px' }}>Chưa có ảnh</div>
                  )}
                  {/* Cập nhật nhãn hiển thị Tên Danh Mục */}
                  {(book.category_id?.category_name || book.genre) && (
                    <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(17, 24, 39, 0.8)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backdropFilter: 'blur(4px)' }}>
                      {book.category_id?.category_name || book.genre?.split(',')[0]}
                    </span>
                  )}
                </div>

                <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 
                    onClick={() => navigate(`/book/${book._id}`)}
                    className="line-clamp-2" 
                    style={{ fontSize: '18px', margin: '0 0 8px 0', color: '#111827', cursor: 'pointer', lineHeight: '1.4' }}
                    title={book.title}
                  >
                    {book.title}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 15px 0', fontWeight: '500' }}>
                    {book.author}
                  </p>
                  
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', fontSize: '13px', fontWeight: '600' }}>
                      <span style={{ 
                        display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', marginRight: '6px',
                        backgroundColor: book.available_quantity > 0 ? '#10b981' : '#ef4444' 
                      }}></span>
                      <span style={{ color: book.available_quantity > 0 ? '#059669' : '#dc2626' }}>
                        {book.available_quantity > 0 ? `Sẵn sàng mượn (${book.available_quantity})` : 'Tạm hết sách'}
                      </span>
                    </div>

                    <button 
                      className="btn-detail"
                      onClick={() => navigate(`/book/${book._id}`)} 
                      style={{ width: '100%', padding: '12px 0', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}
                    >
                      Xem Chi Tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;