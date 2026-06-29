# 📚 Smart Library - Hệ thống Thư viện số thông minh

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**Đồ án Khóa luận Tốt nghiệp**
* **Sinh viên thực hiện:** Đỗ Thị Kim Hương
* **Giảng viên hướng dẫn:** TS. Đoàn Phước Miền

---

## 📖 Giới thiệu
**Smart Library** là hệ thống thư viện số thông minh được thiết kế nhằm số hóa toàn diện quy trình quản lý mượn/trả tài liệu. Dự án giải quyết triệt để các hạn chế của thư viện truyền thống bằng việc tự động hóa các luồng nghiệp vụ (tính phí phạt, nhắc nhở qua Email), chuẩn hóa định vị không gian lưu trữ vật lý, và cá nhân hóa trải nghiệm độc giả thông qua Trí tuệ nhân tạo (AI).

## 🎯 Mục tiêu đồ án
* **Số hóa quy trình:** Chuyển đổi toàn bộ quy trình ghi chép thủ công sang nền tảng số khép kín.
* **Tự động hóa:** Tự động tính phí vi phạm, tự động khóa/mở quyền truy cập dựa trên công nợ, và thiết lập luồng Email giao tiếp tự động.
* **Cá nhân hóa:** Ứng dụng AI phân tích lịch sử hành vi để đề xuất sách và hỗ trợ độc giả 24/7 thông qua ngôn ngữ tự nhiên.

## 🏗 Kiến trúc & Công nghệ sử dụng
Hệ thống được phát triển dựa trên mô hình **Client - Server** và đóng gói bằng **Docker**:

* **Frontend (Client):** `ReactJS`, `TailwindCSS` (Thiết kế SPA mượt mà, hỗ trợ chuẩn font Times New Roman theo chuẩn học thuật).
* **Backend (Server):** `Node.js`, `Express.js`, `Mongoose`, Bảo mật xác thực bằng `JWT` & `Bcrypt`.
* **Cơ sở dữ liệu (Database):** `MongoDB` (Lưu trữ linh hoạt dữ liệu vòng đời phiếu mượn, người dùng, sách).
* **AI Service (Python):** `Flask/FastAPI` xử lý thuật toán Content-based Filtering và tích hợp LLM API.
* **Tích hợp Dịch vụ:** * `Google Books API` / `OpenLibrary API` (Tự động điền siêu dữ liệu sách).
  * `Cron Jobs` & `Nodemailer` (Chạy ngầm tác vụ gửi Email).
  * `Gemini API` (Trợ lý ảo AI Chatbot).

## ✨ Tính năng nổi bật
1. **Global Search đa trường:** Tra cứu sách tức thời theo tên, tác giả, danh mục và vị trí lưu trữ.
2. **Quản lý không gian 3 cấp độ:** Định vị sách chính xác theo cấu trúc Khu vực - Kệ - Ngăn.
3. **Thuật toán xử lý vi phạm:** Tự động đối soát `due_date`, tính phí phạt trễ hạn (5.000 VNĐ/ngày) và bồi thường hư hỏng (20%, 50%, 100%).
4. **Tác vụ ngầm (Background Tasks):** Tự động gửi Email xác nhận, nhắc nhở hạn trả và biên lai điện tử.
5. **Gợi ý & Chatbot AI:** Đề xuất sách thông minh dựa trên lịch sử hoạt động và hỗ trợ tư vấn trực tuyến 24/7.

---

## ⚙️ Yêu cầu hệ thống
Để triển khai hệ thống, máy tính hoặc máy chủ của bạn cần cài đặt sẵn:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (hoặc Docker Engine).
* Git (để clone dự án).

## 🚀 Hướng dẫn Cài đặt & Khởi chạy (Sử dụng Docker)

### Bước 1: Clone mã nguồn
Mở Terminal/Command Prompt và chạy lệnh sau:
```bash
git clone [https://github.com/TenCuaBan/smart-library.git](https://github.com/TenCuaBan/smart-library.git)
cd smart-library
