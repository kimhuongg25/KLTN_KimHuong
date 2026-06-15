import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import * as XLSX from 'xlsx'; 

const ManageBorrowsPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [borrows, setBorrows] = useState([]);

  // --- 1. STATE DÀNH RIÊNG CHO TÌM KIẾM VÀ LỌC ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // --- 2. STATE DÀNH RIÊNG CHO HỘP THOẠI TRẢ SÁCH (MODAL) ---
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [fineInput, setFineInput] = useState(0);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      alert('Truy cập bị từ chối. Chỉ dành cho Quản trị viên!');
      navigate('/');
      return;
    }
    fetchBorrows();
  }, [user, navigate]);

  const fetchBorrows = async () => {
    try {
      const res = await api.get('/borrows/admin/list');
      setBorrows(res.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách phiếu mượn', error);
    }
  };

  // --- 3. LOGIC LỌC & TÌM KIẾM DỮ LIỆU ---
  const filteredBorrows = borrows.filter(record => {
    const username = record.user_id?.username?.toLowerCase() || '';
    const bookTitle = record.book_id?.title?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = username.includes(searchLower) || bookTitle.includes(searchLower);
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // --- 4. HÀM XỬ LÝ NÚT BẤM ---
  const handleUpdateStatus = async (record, newStatus) => {
    if (newStatus === 'approved') {
      if (!window.confirm('Xác nhận duyệt cho mượn cuốn sách này?')) return;
    } 
    else if (newStatus === 'rejected') {
      if (!window.confirm('Từ chối yêu cầu mượn sách này?')) return;
    } 
    else if (newStatus === 'returned') {
      const bookPrice = record.book_id?.book_price || 50000;
      setCurrentRecord(record);
      setFineInput(bookPrice * 0.5); 
      setIsReturnModalOpen(true); 
      return; 
    }

    try {
      await api.put(`/borrows/admin/status/${record._id}`, { status: newStatus });
      alert('Cập nhật trạng thái thành công!');
      fetchBorrows(); 
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  // --- 5. HÀM GỬI DỮ LIỆU TỪ HỘP THOẠI TRẢ SÁCH ---
  const submitReturnBook = async () => {
    try {
      await api.put(`/borrows/admin/status/${currentRecord._id}`, { 
        status: 'returned',
        fine: { amount: Number(fineInput) || 0 } 
      });
      alert('Đã xác nhận trả sách thành công!');
      setIsReturnModalOpen(false);
      fetchBorrows(); 
    } catch (error) {
      console.error("Lỗi trả sách:", error);
      alert(error.response?.data?.message || 'Lỗi khi xác nhận trả sách');
    }
  };

  const handleExportExcel = () => {
    if (filteredBorrows.length === 0) {
      return alert("Không có dữ liệu để xuất!");
    }

    const excelData = filteredBorrows.map((record, index) => ({
      'STT': index + 1,
      'Mã Phiếu': record._id.substring(record._id.length - 6).toUpperCase(),
      'Tên Độc Giả': record.user_id?.username || 'Ẩn danh',
      'Email Độc Giả': record.user_id?.email || 'Không có',
      'Tên Sách': record.book_id?.title || 'Sách đã xóa',
      'Vị Trí Kệ': record.book_id?.shelf_location || 'Chưa xác định',
      'Ngày Tạo Phiếu': new Date(record.createdAt).toLocaleDateString('vi-VN'),
      'Trạng Thái': record.status === 'pending' ? 'Chờ duyệt' : 
                    record.status === 'approved' ? 'Đã duyệt' : 
                    record.status === 'borrowed' ? 'Đang mượn' : 
                    record.status === 'returned' ? 'Đã trả' : 'Bị từ chối',
      'Tiền Phạt (VNĐ)': record.fine?.amount || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh_Sach_Phieu_Muon");

    const colWidths = [
      { wch: 5 }, { wch: 15 }, { wch: 25 }, { wch: 30 }, 
      { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `Bao_Cao_Phieu_Muon_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`);
  };

  const renderStatusBadge = (status) => {
    const badgeStyle = { padding: '6px 12px', borderRadius: '9999px', fontSize: '13px', fontWeight: 'bold' };
    switch(status) {
      case 'pending': return <span style={{ ...badgeStyle, backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>⏳ Chờ Duyệt</span>;
      case 'approved': return <span style={{ ...badgeStyle, backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' }}>🔵 Đã Duyệt</span>;
      case 'borrowed': return <span style={{ ...badgeStyle, backgroundColor: '#f3e8ff', color: '#9333ea', border: '1px solid #e9d5ff' }}>📚 Đang Mượn</span>;
      case 'returned': return <span style={{ ...badgeStyle, backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' }}>✅ Đã Trả</span>;
      case 'rejected': return <span style={{ ...badgeStyle, backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>❌ Đã Hủy</span>;
      default: return status;
    }
  };

  if (!user || user.role !== 'admin') return null;

  const actionBtnStyle = {
    padding: '8px 14px', border: 'none', borderRadius: '6px', cursor: 'pointer',
    fontWeight: 'bold', fontSize: '14px', transition: 'all 0.2s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    fontFamily: "'Times New Roman', Times, serif"
  };

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '30px 20px', fontFamily: "'Times New Roman', Times, serif" }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto', position: 'relative' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: '#111827', fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0' }}>
              📋 Quản Lý Phiếu Mượn
            </h2>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>Kiểm duyệt và theo dõi trạng thái sách của độc giả.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleExportExcel} style={{ padding: '10px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)', fontFamily: "'Times New Roman', Times, serif" }}>
              <span style={{ marginRight: '8px' }}>📊</span> Xuất Báo Cáo Excel
            </button>
            <Link to="/admin" style={{ textDecoration: 'none', backgroundColor: '#ffffff', color: '#4b5563', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', fontFamily: "'Times New Roman', Times, serif" }}>
              <span style={{ marginRight: '8px' }}>⬅</span> Về Bảng Điều Khiển
            </Link>
          </div>
        </div>

        {/* --- KHU VỰC THANH CÔNG CỤ TÌM KIẾM & LỌC --- */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ flex: 2 }}>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>🔍 Tìm kiếm phiếu mượn</label>
            <input 
              type="text" 
              placeholder="Nhập tên độc giả hoặc tên sách..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', fontSize: '15px', fontFamily: "'Times New Roman', Times, serif" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>🏷️ Lọc theo trạng thái</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', backgroundColor: '#f9fafb', cursor: 'pointer', fontSize: '15px', fontFamily: "'Times New Roman', Times, serif" }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">⏳ Chờ duyệt</option>
              <option value="approved">🔵 Đã duyệt</option>
              <option value="borrowed">📚 Đang mượn</option>
              <option value="returned">✅ Đã trả</option>
              <option value="rejected">❌ Đã hủy</option>
            </select>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1100px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: '#374151', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>Người Mượn</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: '#374151', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>Tên Sách</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: '#374151', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>Vị trí Kệ</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', color: '#374151', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>Ngày Đăng Ký</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', color: '#374151', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>Trạng Thái</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', color: '#374151', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>Tiền Phạt</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', color: '#374151', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>Hành Động</th>
                </tr>
              </thead>
              <tbody style={{ divideY: '1px solid #e5e7eb' }}>
                {filteredBorrows.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280', fontSize: '16px' }}>
                      Không tìm thấy phiếu mượn nào phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredBorrows.map(record => (
                    <tr key={record._id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ color: '#111827', fontWeight: 'bold', fontSize: '16px' }}>{record.user_id?.fullName || record.user_id?.username || 'User ẩn'}</div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>{record.user_id?.email}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ color: '#374151', fontWeight: 'bold', fontSize: '16px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={record.book_id?.title}>
                          {record.book_id?.title || 'Sách đã xóa'}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#059669', fontWeight: 'bold', fontSize: '15px' }}>
                        {record.book_id?.shelf_location || 'Chưa XĐ'}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center', color: '#4b5563', fontSize: '15px' }}>
                        {new Date(record.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        {renderStatusBadge(record.status)}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <span style={{ color: record.fine?.amount > 0 ? '#dc2626' : '#9ca3af', fontWeight: record.fine?.amount > 0 ? 'bold' : 'normal', backgroundColor: record.fine?.amount > 0 ? '#fee2e2' : 'transparent', padding: record.fine?.amount > 0 ? '4px 8px' : '0', borderRadius: '6px' }}>
                          {record.fine?.amount > 0 ? `${record.fine.amount.toLocaleString()} đ` : '---'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center', minWidth: '220px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          
                          {/* Đang chờ duyệt */}
                          {record.status === 'pending' && (
                            <>
                              <button onClick={() => handleUpdateStatus(record, 'approved')} style={{ ...actionBtnStyle, backgroundColor: '#4f46e5', color: 'white' }}>Duyệt</button>
                              <button onClick={() => handleUpdateStatus(record, 'rejected')} style={{ ...actionBtnStyle, backgroundColor: '#ffffff', color: '#ef4444', border: '1px solid #fca5a5' }}>Từ chối</button>
                            </>
                          )}

                          {/* Đã duyệt (Chờ lấy sách) */}
                          {record.status === 'approved' && (
                            <button onClick={() => handleUpdateStatus(record, 'borrowed')} style={{ ...actionBtnStyle, backgroundColor: '#8b5cf6', color: 'white' }}>Xác nhận Giao sách</button>
                          )}

                          {/* Đang cầm sách (Chờ trả) */}
                          {record.status === 'borrowed' && (
                            <button onClick={() => handleUpdateStatus(record, 'returned')} style={{ ...actionBtnStyle, backgroundColor: '#10b981', color: 'white' }}>Xác nhận Thu hồi</button>
                          )}

                          {/* Đã kết thúc */}
                          {(record.status === 'returned' || record.status === 'rejected') && (
                            <span style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '15px' }}>Đã xử lý xong</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* --- GIAO DIỆN HỘP THOẠI NHẬP TIỀN PHẠT --- */}
      {isReturnModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', width: '450px', maxWidth: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e5e7eb' }}>
            
            <h3 style={{ marginTop: 0, color: '#111827', fontSize: '22px', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
              <span style={{ fontSize: '24px', marginRight: '10px' }}>✅</span> Xác nhận nhận lại sách
            </h3>
            
            <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
              Độc giả đang trả cuốn sách: <strong style={{ color: '#111827' }}>{currentRecord?.book_id?.title}</strong>
            </p>
            
            <div style={{ backgroundColor: '#fffbeb', padding: '15px', borderRadius: '10px', border: '1px solid #fde68a', marginBottom: '20px' }}>
              <p style={{ margin: 0, color: '#92400e', fontSize: '15px', lineHeight: '1.5' }}>
                ⚠️ <strong>Lưu ý:</strong> Tiền phạt trễ hạn (nếu có) sẽ được hệ thống tính tự động. Bạn chỉ cần nhập phí phạt hư hỏng bên dưới.
                <br/>Giá trị gốc của sách: <strong>{(currentRecord?.book_id?.book_price || 50000).toLocaleString()} VNĐ</strong>.
                <br/><br/><i>Nếu sách hoàn toàn nguyên vẹn, hãy để là số 0.</i>
              </p>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151', fontSize: '15px' }}>Tiền phạt hư hỏng/mất sách (VNĐ):</label>
              <input 
                type="number" 
                min="0"
                value={fineInput} 
                onChange={(e) => setFineInput(e.target.value)} 
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid #e5e7eb', outline: 'none', fontSize: '16px', boxSizing: 'border-box', transition: 'border-color 0.2s', color: '#111827', fontWeight: 'bold', fontFamily: "'Times New Roman', Times, serif" }}
                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsReturnModalOpen(false)} style={{ padding: '10px 20px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', color: '#374151', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', fontFamily: "'Times New Roman', Times, serif" }}>
                Hủy bỏ
              </button>
              <button onClick={submitReturnBook} style={{ padding: '10px 20px', border: 'none', backgroundColor: '#10b981', color: '#ffffff', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)', fontFamily: "'Times New Roman', Times, serif" }}>
                Xác nhận Trả & Lưu
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageBorrowsPage;