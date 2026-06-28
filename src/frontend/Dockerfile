# Stage 1: Build ứng dụng React
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Phục vụ bằng Nginx
FROM nginx:alpine
# Copy file đã build từ Stage 1 sang thư mục của Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Nếu bạn dùng create-react-app (thư mục build), đổi /app/dist thành /app/build

# Mở cổng 80 cho web
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]