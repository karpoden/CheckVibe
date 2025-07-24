# Stage 1: Build Vite app
FROM node:18 as builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY frontend/package*.json ./
RUN npm ci --only=production

# Копируем исходный код
COPY frontend/ .

# Собираем приложение
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Удаляем стандартную конфигурацию
RUN rm /etc/nginx/conf.d/default.conf

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

