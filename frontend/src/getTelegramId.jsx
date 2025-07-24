export function getTelegramId() {
  // 1. Пробуем получить из Telegram WebApp
  const tg = window.Telegram?.WebApp;
  console.log('Telegram WebApp объект:', tg);
  console.log('initDataUnsafe:', tg?.initDataUnsafe);
  console.log('user:', tg?.initDataUnsafe?.user);
  
  const id = tg?.initDataUnsafe?.user?.id;
  if (id) {
    console.log('Получен ID из Telegram:', id);
    return String(id);
  }

  // 2. Пробуем получить из query-параметра (для теста)
  const params = new URLSearchParams(window.location.search);
  const urlId = params.get('user_id');
  if (urlId) {
    console.log('Получен ID из URL:', urlId);
    return String(urlId);
  }

  // 3. Возвращаем null если ID не найден
  console.log('ID не найден');
  return null;
}