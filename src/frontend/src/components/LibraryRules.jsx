import React, { useState } from 'react';

const LibraryRules = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Nút bấm nổi dấu ? ở góc dưới bên trái */}
      <div 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '30px',
          left: '30px', // Đặt bên trái để không đụng Chatbot bên phải
          width: '50px',
          height: '50px',
          backgroundColor: '#4f46e5', // Màu xanh tím đồng bộ với theme
          color: 'white',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '26px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          zIndex: 998,
          fontFamily: "'Times New Roman', Times, serif",
          transition: 'transform 0.2s ease'
        }}
        title="Quy định Mượn / Trả sách"
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        ?
      </div>

      {/* Hộp thoại Modal Popup (Bật lên khi bấm nút) */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000,
          fontFamily: "'Times New Roman', Times, serif"
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '650px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            position: 'relative',
            maxHeight: '85vh',
            overflowY: 'auto' // Cho phép cuộn nếu nội dung dài
          }}>
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute', top: '15px', right: '15px',
                background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280'
              }}
            >
              ✖
            </button>

            <h2 style={{ color: '#111827', marginTop: 0, textAlign: 'center', borderBottom: '2px solid #f3f4f6', paddingBottom: '15px' }}>
              📖 Nội Quy Thư Viện
            </h2>

            <div style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6' }}>
              <h4 style={{ color: '#4f46e5', marginBottom: '8px', fontSize: '18px' }}>1. Quy định mượn sách</h4>
              <ul style={{ margin: '0 0 15px 0', paddingLeft: '20px' }}>
                <li>Độc giả phải sử dụng tài khoản cá nhân hợp lệ trên hệ thống để đăng ký mượn sách.</li>
                <li>Thời hạn mượn sách tối đa là <strong>14 ngày</strong> kể từ ngày thư viện duyệt phiếu mượn.</li>
                <li>Mỗi độc giả chỉ được phép mượn tối đa 3 cuốn sách trong cùng một thời điểm.</li>
              </ul>

              <h4 style={{ color: '#4f46e5', marginBottom: '8px', fontSize: '18px' }}>2. Trách nhiệm bảo quản</h4>
              <ul style={{ margin: '0 0 15px 0', paddingLeft: '20px' }}>
                <li>Kiểm tra kỹ tình trạng sách (rách bìa, mất trang) ngay khi nhận sách từ thủ thư.</li>
                <li>Không viết, vẽ, gập trang, làm dính nước hoặc làm thay đổi hiện trạng ban đầu của sách.</li>
              </ul>

              <h4 style={{ color: '#dc2626', marginBottom: '8px', fontSize: '18px' }}>3. Xử lý vi phạm & Phạt tiền</h4>
              <ul style={{ margin: '0 0 15px 0', paddingLeft: '20px' }}>
                <li><strong>Mượn quá hạn:</strong> Phạt 5.000 VNĐ / ngày trễ hạn / cuốn sách.</li>
                <li><strong>Làm hư hỏng (rách bìa, vấy bẩn...):</strong> Bồi thường từ 20% đến 100% giá trị cuốn sách tùy mức độ.</li>
                <li><strong>Làm mất sách:</strong> Bồi thường 200% giá trị hiện tại của cuốn sách.</li>
                <li><strong>Khóa tài khoản:</strong> Tài khoản độc giả sẽ bị hệ thống tự động khóa chức năng mượn sách mới nếu có khoản phạt chưa thanh toán.</li>
              </ul>
            </div>

            <div style={{ textAlign: 'center', marginTop: '25px' }}>
              <button 
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '12px 30px', backgroundColor: '#4f46e5', color: 'white', border: 'none',
                  borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px',
                  fontFamily: "'Times New Roman', Times, serif"
                }}
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LibraryRules;