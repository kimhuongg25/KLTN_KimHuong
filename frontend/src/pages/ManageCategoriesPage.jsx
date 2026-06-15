import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ManageCategoriesPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [nameInput, setNameInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      alert('Từ chối truy cập!');
      navigate('/');
      return;
    }
    fetchCategories();
  }, [user, navigate]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    try {
      if (isEditing) {
        await api.put(`/categories/${editId}`, { category_name: nameInput });
        alert('Cập nhật danh mục thành công!');
      } else {
        await api.post('/categories', { category_name: nameInput });
        alert('Thêm danh mục thành công!');
      }
      setNameInput('');
      setIsEditing(false);
      setEditId(null);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (cat) => {
    setIsEditing(true);
    setEditId(cat._id);
    setNameInput(cat.category_name);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await api.delete(`/categories/${id}`);
        alert('Xóa thành công!');
        fetchCategories();
      } catch (error) {
        alert(error.response?.data?.message || 'Không thể xóa danh mục này');
      }
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '30px 20px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: '#111827', fontSize: '26px', fontWeight: '800', margin: 0 }}>🗂️ Quản Lý Danh Mục Sách</h2>
            <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Phân loại hệ thống kho sách bài bản.</p>
          </div>
          <Link to="/admin" style={{ textDecoration: 'none', backgroundColor: '#ffffff', color: '#4b5563', padding: '10px 16px', borderRadius: '8px', fontWeight: '600', border: '1px solid #d1d5db' }}>⬅ Về Bảng Điều Khiển</Link>
        </div>

        {/* Form thêm/sửa nhanh */}
        <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <input 
            type="text" 
            value={nameInput} 
            onChange={(e) => setNameInput(e.target.value)} 
            placeholder="Nhập tên danh mục (VD: Công Nghệ Thông Tin...)" 
            required 
            style={{ flex: 1, padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', outline: 'none' }}
          />
          <button type="submit" style={{ padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: '600', color: 'white', backgroundColor: isEditing ? '#f59e0b' : '#4f46e5', cursor: 'pointer' }}>
            {isEditing ? 'Cập Nhật' : '＋ Thêm Mới'}
          </button>
          {isEditing && <button type="button" onClick={() => { setIsEditing(false); setNameInput(''); }} style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#f3f4f6', cursor: 'pointer' }}>Hủy</button>}
        </form>

        {/* Bảng danh sách */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '14px', textAlign: 'left', color: '#6b7280', fontSize: '13px' }}>Tên Danh Mục</th>
                <th style={{ padding: '14px', textAlign: 'center', color: '#6b7280', fontSize: '13px', width: '150px' }}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '14px', color: '#111827', fontWeight: '500' }}>{cat.category_name}</td>
                  <td style={{ padding: '14px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button onClick={() => handleEdit(cat)} style={{ padding: '6px 12px', border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Sửa</button>
                    <button onClick={() => handleDelete(cat._id)} style={{ padding: '6px 12px', border: '1px solid #f87171', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default ManageCategoriesPage;