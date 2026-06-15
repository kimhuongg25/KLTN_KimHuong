import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import axios from 'axios';

const AdminPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);

  // 1. STATE TÌM KIẾM SÁCH
  const [searchTerm, setSearchTerm] = useState('');

  // 2. LOGIC LỌC SÁCH
  const filteredBooks = books.filter(book => 
    (book.title && book.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // 1. STATE MỚI: Chứa danh sách Danh mục đổ từ Database
  const [categories, setCategories] = useState([]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editBookId, setEditBookId] = useState(null);
  
  const [coverFile, setCoverFile] = useState(null);

  // 2. CẬP NHẬT STATE: Bổ sung category_id
  const [newBook, setNewBook] = useState({
    title: '', author: '', description: '', available_quantity: 1, cover_image: '',
    publish_year: '', publisher: '', genre: '', page_count: '',
    shelf_location: '', book_price: 50000, category_id: '' 
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      alert('Truy cập bị từ chối. Chỉ dành cho Quản trị viên!');
      navigate('/');
      return;
    }
    fetchBooks();
    fetchCategories(); // Gọi hàm lấy danh mục khi trang vừa load
  }, [user, navigate]);

  const fetchBooks = async () => {
    try {
      const res = await api.get('/books');
      setBooks(res.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách sách', error);
    }
  };

  // 3. HÀM MỚI: Lấy danh sách Categories từ API
  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error("Không lấy được danh mục sách", error);
    }
  };


  const handleAutoFill = async () => {
    if (!newBook.title) {
      return alert('Vui lòng nhập Tên sách trước khi tra cứu!');
    }
    
    setIsSearching(true);
    const searchQuery = encodeURIComponent(newBook.title);

    const getShortDescription = (desc) => {
      if (!desc) return 'Chưa có mô tả cho cuốn sách này.';
      let text = '';
      if (typeof desc === 'string') text = desc;
      else if (typeof desc === 'object') text = desc.value || desc.text || JSON.stringify(desc);
      text = text.replace(/<\/?[^>]+(>|$)/g, "");
      if (!text.trim()) return 'Chưa có mô tả cho cuốn sách này.';
      if (text.length > 250) return text.substring(0, 250).trim() + '...';
      return text;
    };

    try {
      const googleRes = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=intitle:${searchQuery}`);
      if (googleRes.data.items && googleRes.data.items.length > 0) {
        const bookData = googleRes.data.items[0].volumeInfo;
        setNewBook(prev => ({
          ...prev,
          author: bookData.authors ? bookData.authors.join(', ') : 'Chưa rõ',
          description: getShortDescription(bookData.description),
          cover_image: bookData.imageLinks?.thumbnail || '',
          publish_year: bookData.publishedDate ? bookData.publishedDate.substring(0, 4) : '',
          publisher: bookData.publisher || '',
          genre: bookData.categories ? bookData.categories[0] : '', // Vẫn giữ genre tạm để gợi ý
          page_count: bookData.pageCount || ''
        }));
        setIsSearching(false);
        return alert('🎉 Đã tìm thấy thông tin tự động từ Google Books! Vui lòng tự chọn Danh Mục phù hợp ở ô bên dưới.');
      }
    } catch (googleError) {
      console.warn("Google API bị quá tải. Đang tự động chuyển sang OpenLibrary...");
    }

    try {
      const openLibRes = await axios.get(`https://openlibrary.org/search.json?title=${searchQuery}&limit=1`);
      if (openLibRes.data.docs && openLibRes.data.docs.length > 0) {
        const bookData = openLibRes.data.docs[0];
        const coverImageUrl = bookData.cover_i ? `https://covers.openlibrary.org/b/id/${bookData.cover_i}-L.jpg` : '';
        let openLibDesc = '';
        if (bookData.key) {
          try {
            const detailRes = await axios.get(`https://openlibrary.org${bookData.key}.json`);
            openLibDesc = detailRes.data.description || '';
          } catch (e) {
            console.warn("Không lấy được mô tả chi tiết từ OpenLibrary");
          }
        }
        setNewBook(prev => ({
          ...prev,
          author: bookData.author_name ? bookData.author_name.join(', ') : 'Chưa rõ',
          description: getShortDescription(openLibDesc),
          cover_image: coverImageUrl,
          publish_year: bookData.first_publish_year ? bookData.first_publish_year.toString() : '',
          publisher: bookData.publisher ? bookData.publisher[0] : '',
          genre: bookData.subject ? bookData.subject.slice(0, 3).join(', ') : '',
          page_count: bookData.number_of_pages_median || ''
        }));
        setIsSearching(false);
        return alert('⚠️ Đã lấy dữ liệu từ OpenLibrary. Vui lòng tự chọn Danh Mục phù hợp ở ô bên dưới.');
      } else {
        alert('Không tìm thấy thông tin cuốn sách này trên cả 2 hệ thống!');
      }
    } catch (openLibError) {
      console.error("Lỗi toàn tập:", openLibError);
      alert('Lỗi kết nối mạng. Vui lòng thử lại sau.');
    }
    setIsSearching(false);
  };

  const handleEditClick = (book) => {
    setIsEditing(true);
    setEditBookId(book._id);
    setCoverFile(null); 
    
    setNewBook({
      title: book.title || '',
      author: book.author || '',
      description: book.description || '',
      available_quantity: book.available_quantity || 1, 
      cover_image: book.cover_image || '', 
      publish_year: book.publish_year || '',
      publisher: book.publisher || '',
      genre: book.genre || '',
      page_count: book.page_count || '',
      shelf_location: book.shelf_location || '',
      book_price: book.book_price || 50000,
      // Xử lý lấy ID danh mục nếu backend trả về object populate hoặc string ID
      category_id: book.category_id?._id || book.category_id || '' 
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleSubmitBook = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', newBook.title);
    formData.append('author', newBook.author);
    formData.append('description', newBook.description);
    formData.append('available_quantity', Number(newBook.available_quantity) || 1);
    formData.append('publish_year', newBook.publish_year);
    formData.append('publisher', newBook.publisher);
    formData.append('genre', newBook.genre); // Vẫn gửi genre như 1 text phụ
    formData.append('page_count', newBook.page_count);
    formData.append('shelf_location', newBook.shelf_location);
    formData.append('book_price', Number(newBook.book_price) || 50000);
    
    // 4. GỬI KÈM CATEGORY_ID
    if (newBook.category_id) {
      formData.append('category_id', newBook.category_id);
    }

    if (coverFile) {
      formData.append('cover_image', coverFile);
    } else if (newBook.cover_image) {
      formData.append('cover_image', newBook.cover_image); 
    }

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (isEditing) {
        await api.put(`/books/${editBookId}`, formData, config);
        alert('Cập nhật thông tin sách thành công!');
      } else {
        await api.post('/books', formData, config);
        alert('Thêm sách mới thành công!');
      }
      resetForm();
      fetchBooks();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi lưu sách');
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setIsEditing(false);
    setEditBookId(null);
    setCoverFile(null);
    setNewBook({ title: '', author: '', description: '', available_quantity: 1, cover_image: '', publish_year: '', publisher: '', genre: '', page_count: '', shelf_location: '', book_price: 50000, category_id: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cuốn sách này khỏi hệ thống?')) {
      try {
        await api.delete(`/books/${id}`);
        alert('Xóa sách thành công!');
        fetchBooks();
      } catch (error) {
        alert(error.response?.data?.message || 'Lỗi khi xóa sách');
      }
    }
  };

  if (!user || user.role !== 'admin') return null;

  const inputStyle = { width: '100%', padding: '12px 14px', marginTop: '6px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#f9fafb', fontSize: '15px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s ease-in-out' };
  const labelStyle = { fontWeight: '600', color: '#374151', fontSize: '14px' };
  const btnStyle = { padding: '10px 16px', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '30px 20px', fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#111827', fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0' }}>Bảng Điều Khiển Quản Trị</h2>
          <p style={{ color: '#6b7280', margin: '0 0 20px 0', fontSize: '15px' }}>Quản lý hệ thống thư viện thông minh của bạn.</p>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ ...btnStyle, backgroundColor: '#4f46e5', color: 'white', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)' }}>
              <span style={{ marginRight: '8px' }}>📦</span> Quản Lý Kho Sách
            </button>
            <button onClick={() => navigate('/admin/categories')} style={{ ...btnStyle, backgroundColor: '#ffffff', color: '#4b5563', border: '1px solid #d1d5db', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <span style={{ marginRight: '8px' }}>🗂️</span> Danh Mục Sách
            </button>
            <button onClick={() => navigate('/admin/borrows')} style={{ ...btnStyle, backgroundColor: '#ffffff', color: '#4b5563', border: '1px solid #d1d5db', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <span style={{ marginRight: '8px' }}>📋</span> Quản Lý Phiếu Mượn
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
          <h3 style={{ margin: 0, color: '#1f2937', fontSize: '18px', fontFamily: "'Times New Roman', Times, serif" }}>Kho Sách Hiện Tại</h3>
          
          {/* THANH TÌM KIẾM */}
          <div style={{ flex: '1', minWidth: '250px', maxWidth: '400px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Tìm tên sách hoặc tác giả..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontFamily: "'Times New Roman', Times, serif", fontSize: '15px', backgroundColor: '#f9fafb', boxSizing: 'border-box' }}
            />
          </div>

          <button onClick={() => showAddForm ? resetForm() : setShowAddForm(true)} style={{ ...btnStyle, backgroundColor: showAddForm ? '#f3f4f6' : '#10b981', color: showAddForm ? '#374151' : 'white', boxShadow: showAddForm ? 'none' : '0 4px 6px rgba(16, 185, 129, 0.2)' }}>
            {showAddForm ? 'Thoát' : '+ Thêm Sách Mới'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmitBook} style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', marginBottom: '30px', border: '1px solid #e5e7eb' }}>
            <h4 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '18px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
              {isEditing ? 'Sửa Thông Tin Sách' : 'Nhập Sách Mới'}
            </h4>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Tên sách (Nhập chính xác để tra cứu):</label>
                <input type="text" value={newBook.title} onChange={(e) => setNewBook({...newBook, title: e.target.value})} required style={{ ...inputStyle, border: '2px solid #4f46e5', backgroundColor: '#fff' }} placeholder="VD: Đắc Nhân Tâm..." />
              </div>
              {!isEditing && (
                <button type="button" onClick={handleAutoFill} disabled={isSearching} style={{ ...btnStyle, backgroundColor: '#8b5cf6', color: 'white', height: '46px', padding: '0 24px', boxShadow: '0 4px 6px rgba(139, 92, 246, 0.25)' }}>
                  {isSearching ? 'Đang tìm...' : '⚡ AI Tự Động Điền'}
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div><label style={labelStyle}>Tác giả:</label><input type="text" value={newBook.author} onChange={(e) => setNewBook({...newBook, author: e.target.value})} required style={inputStyle} /></div>
              
              {/* 5. ĐÃ SỬA THÀNH DROPDOWN DANH MỤC */}
              <div>
                <label style={labelStyle}>🗂️ Danh Mục Hệ Thống:</label>
                <select 
                  value={newBook.category_id} 
                  onChange={(e) => setNewBook({...newBook, category_id: e.target.value})} 
                  required
                  style={inputStyle}
                >
                  <option value="">-- Chọn Danh Mục --</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.category_name}</option>
                  ))}
                </select>
                {newBook.genre && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>AI Gợi ý: {newBook.genre}</p>}
              </div>

              <div><label style={labelStyle}>Nhà xuất bản:</label><input type="text" value={newBook.publisher} onChange={(e) => setNewBook({...newBook, publisher: e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>Năm xuất bản:</label><input type="text" value={newBook.publish_year} onChange={(e) => setNewBook({...newBook, publish_year: e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>Số trang:</label><input type="number" value={newBook.page_count} onChange={(e) => setNewBook({...newBook, page_count: e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>Số lượng kho:</label><input type="number" min="1" value={newBook.available_quantity} onChange={(e) => setNewBook({...newBook, available_quantity: e.target.value})} required style={inputStyle} /></div>
              
              <div>
                <label style={labelStyle}>📍 Vị trí kệ sách:</label>
                <input type="text" value={newBook.shelf_location} onChange={(e) => setNewBook({...newBook, shelf_location: e.target.value})} placeholder="VD: Kệ A1 - Tầng 2" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>💰 Giá trị sách (VNĐ):</label>
                <input type="number" min="0" value={newBook.book_price} onChange={(e) => setNewBook({...newBook, book_price: e.target.value})} required style={inputStyle} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>🖼️ Ảnh bìa sách:</label>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '6px' }}>
                  <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} style={{ ...inputStyle, marginTop: 0, flex: 1, padding: '9px', cursor: 'pointer' }} />
                  <span style={{ color: '#6b7280', fontWeight: 'bold', fontSize: '13px' }}>HOẶC</span>
                  <input type="text" value={newBook.cover_image} onChange={(e) => setNewBook({...newBook, cover_image: e.target.value})} style={{ ...inputStyle, marginTop: 0, flex: 1 }} placeholder="Nhập/dán link URL ảnh vào đây..." />
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <label style={labelStyle}>Mô tả nội dung:</label>
              <textarea value={newBook.description} onChange={(e) => setNewBook({...newBook, description: e.target.value})} style={{ ...inputStyle, height: '100px', resize: 'vertical' }} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '25px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
              <button type="button" onClick={resetForm} style={{ ...btnStyle, backgroundColor: '#f3f4f6', color: '#4b5563', marginRight: '12px' }}>Hủy bỏ</button>
              <button type="submit" style={{ ...btnStyle, backgroundColor: isEditing ? '#f59e0b' : '#4f46e5', color: 'white', padding: '12px 30px' }}>
                {isEditing ? '💾 Cập Nhật Sách' : '☁️ Tải Sách Lên Đám Mây'}
              </button>
            </div>
          </form>
        )}

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1100px', fontFamily: "'Times New Roman', Times, serif" }}>
  <thead>
    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
      <th style={{ padding: '16px', textAlign: 'left', color: '#475569', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sách & Tác Giả</th>
      <th style={{ padding: '16px', textAlign: 'left', color: '#475569', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Danh Mục</th>
      <th style={{ padding: '16px', textAlign: 'left', color: '#475569', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thông Tin XB</th>
      <th style={{ padding: '16px', textAlign: 'right', color: '#475569', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Giá Trị</th>
      <th style={{ padding: '16px', textAlign: 'left', color: '#475569', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vị Trí Kệ</th>
      <th style={{ padding: '16px', textAlign: 'center', color: '#475569', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kho</th>
      <th style={{ padding: '16px', textAlign: 'center', color: '#475569', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hành Động</th>
    </tr>
  </thead>
  <tbody style={{ divideY: '1px solid #f1f5f9' }}>
    {filteredBooks.map((book) => (
      <tr key={book._id} style={{ borderBottom: '1px solid #f8fafc', transition: 'all 0.2s', ':hover': { backgroundColor: '#f1f5f9' } }}>
        
        {/* Cột 1: Cụm Ảnh bìa + Tên Sách + Tác giả */}
        <td style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '45px', height: '65px', borderRadius: '6px', backgroundColor: '#e2e8f0', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              {book.cover_image ? (
                <img src={book.cover_image} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94a3b8' }}>Trống</div>
              )}
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '16px', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={book.title}>
                {book.title}
              </div>
              <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', fontStyle: 'italic' }}>
                {book.author}
              </div>
            </div>
          </div>
        </td>
        
        {/* Cột 2: Nhãn Danh mục */}
        <td style={{ padding: '16px' }}>
          <span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', padding: '6px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', display: 'inline-block' }}>
            {book.category_id?.category_name || categories.find(c => c._id === book.category_id)?.category_name || book.genre || 'Chưa phân loại'}
          </span>
        </td>
        
        {/* Cột 3: Thông tin xuất bản */}
        <td style={{ padding: '16px', color: '#475569', fontSize: '14px' }}>
          <div style={{ fontWeight: '600', color: '#334155' }}>{book.publisher || 'Chưa rõ NXB'}</div>
          <div style={{ color: '#94a3b8', marginTop: '4px' }}>
            {book.publish_year ? `${book.publish_year}` : ''} 
            {book.page_count ? ` • ${book.page_count} trang` : ''}
          </div>
        </td>

        {/* Cột 4: Giá tiền */}
        <td style={{ padding: '16px', textAlign: 'right', color: '#0f172a', fontWeight: '700', fontSize: '15px' }}>
          {book.book_price ? book.book_price.toLocaleString('vi-VN') + ' đ' : '0 đ'}
        </td>
        
        {/* Cột 5: Nhãn Vị trí kệ */}
        <td style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>📍</span>
            <span style={{ color: '#059669', fontWeight: '700', fontSize: '14px', backgroundColor: '#d1fae5', padding: '6px 10px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
              {book.shelf_location || 'Chưa XĐ'}
            </span>
          </div>
        </td>
        
        {/* Cột 6: Badge Tồn kho */}
        <td style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', height: '32px', borderRadius: '50%', backgroundColor: book.available_quantity > 0 ? '#10b981' : '#ef4444', color: 'white', fontSize: '14px', fontWeight: '700', padding: '0 8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {book.available_quantity}
          </div>
        </td>

        {/* Cột 7: Nút Hành động */}
        <td style={{ padding: '16px', textAlign: 'center', minWidth: '110px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button onClick={() => handleEditClick(book)} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', color: '#3b82f6', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', outline: 'none' }} title="Sửa">
              ✏️
            </button>
            <button onClick={() => handleDelete(book._id)} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', outline: 'none' }} title="Xóa">
              🗑️
            </button>
          </div>
        </td>

      </tr>
    ))}
    {filteredBooks.length === 0 && (
      <tr>
        <td colSpan="7" style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '45px', marginBottom: '15px' }}>{searchTerm ? '🕵️‍♂️' : '📚'}</div>
          <div style={{ fontSize: '16px', fontWeight: '600', fontFamily: "'Times New Roman', Times, serif" }}>
            {searchTerm ? `Không tìm thấy sách nào khớp với từ khóa "${searchTerm}"` : 'Chưa có sách nào trong kho.'}
          </div>
        </td>
      </tr>
    )}
  </tbody>
</table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPage;