# Sử dụng image Node.js nhẹ
FROM node:22-alpine

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Mở cổng (giả sử backend chạy port 5000)
EXPOSE 5000

# Lệnh khởi chạy server
CMD ["npm", "start"]