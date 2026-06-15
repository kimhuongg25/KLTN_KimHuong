from pymongo import MongoClient
import pandas as pd
import random # Tạm thời dùng để mô phỏng sự đa dạng

# 1. Kết nối vào MongoDB (Giống hệt cách NodeJS đang kết nối)
client = MongoClient('mongodb://127.0.0.1:27017/')
db = client['kltn_library_db'] # Đảm bảo tên DB trùng khớp với file .env của bạn

users_col = db['users']
books_col = db['books']
activities_col = db['useractivities']
reviews_col = db['reviews']

def calculate_recommendations():
    print("🚀 Bắt đầu chạy hệ thống phân tích AI...")
    
    # Lấy danh sách toàn bộ Users và Books
    users = list(users_col.find({}))
    books = list(books_col.find({}))
    
    if not users or not books:
        print("❌ Dữ liệu trống. Vui lòng thêm User và Book trước.")
        return

    # Lặp qua từng người dùng để tính toán
    for user in users:
        user_id = user['_id']
        
        # 2. Lấy lịch sử tương tác của người dùng này
        user_activities = list(activities_col.find({'user_id': user_id}))
        interacted_book_ids = [act['book_id'] for act in user_activities]
        
        user_recommendations = []
        
        # 3. Thuật toán gợi ý (V1: Lọc bỏ sách đã tương tác, ưu tiên sách mới)
        for book in books:
            # Nếu user chưa từng mượn, xem hay đánh giá cuốn này
            if book['_id'] not in interacted_book_ids:
                # Ở phiên bản V2, điểm này sẽ được tính bằng Cosine Similarity / Machine Learning.
                # Hiện tại, ta giả lập một điểm số ngẫu nhiên từ 0.70 đến 0.99 để test luồng dữ liệu.
                ai_score = round(random.uniform(0.70, 0.99), 2) 
                
                user_recommendations.append({
                    'book_id': book['_id'],
                    'score': ai_score
                })
        
        # Sắp xếp lấy 5 cuốn có điểm cao nhất
        top_5_books = sorted(user_recommendations, key=lambda x: x['score'], reverse=True)[:5]
        
        # 4. Lưu ngược kết quả vào MongoDB cho hệ thống Backend đọc
        if top_5_books:
            users_col.update_one(
                {'_id': user_id},
                {'$set': {'recommendations': top_5_books}}
            )
            print(f"✅ Đã cập nhật {len(top_5_books)} sách gợi ý cho tài khoản: {user.get('username')}")

if __name__ == "__main__":
    calculate_recommendations()
    print("🎉 Quá trình phân tích hoàn tất!")