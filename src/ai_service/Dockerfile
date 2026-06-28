FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Giả sử API Python chạy port 8000
EXPOSE 8000

# Khởi chạy bằng lệnh tương ứng (Ví dụ dùng Flask hoặc FastAPI)
CMD ["python", "app.py"] 
# Hoặc CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]