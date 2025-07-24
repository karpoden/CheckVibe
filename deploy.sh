#!/bin/bash

echo "🚀 Запуск продакшн версии CheckVibe..."

# Останавливаем существующие контейнеры
docker-compose -f docker compose.prod.yml down

# Пересобираем образы
docker-compose -f docker compose.prod.yml build --no-cache

# Запускаем сервисы
docker-compose -f docker compose.prod.yml up -d

echo "✅ Продакшн версия запущена!"
echo "🌐 Приложение доступно по адресу: http://checkvibeapp.ru"

# Показываем логи
docker-compose -f docker compose.prod.yml logs -f