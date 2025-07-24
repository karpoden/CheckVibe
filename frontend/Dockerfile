# Stage 1: Build Vite app
FROM node:18 as builder

WORKDIR /app
COPY . .
RUN npm install && npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Удалим default.conf, если есть
RUN rm /etc/nginx/conf.d/default.conf

# Копируем свою настройку Nginx
COPY nginx.conf /etc/nginx/conf.d

# Копируем собранный фронтенд
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

