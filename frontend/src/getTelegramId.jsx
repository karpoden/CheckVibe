export function getTelegramId() {
  // 1. Пробуем получить из Telegram WebApp
  const tg = window.Telegram?.WebApp;
  const id = tg?.initDataUnsafe?.user?.id;
  if (id) return String(id);

  // 2. Пробуем получить из query-параметра (для теста)
  const params = new URLSearchParams(window.location.search);
  const urlId = params.get('user_id');
  if (urlId) return String(urlId);

  // 3. Можно вернуть null или тестовый id
  return null;
}