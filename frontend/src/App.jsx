import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import WelcomeModal from "./components/WelcomeModal";
import { getTelegramId } from "./getTelegramId";
import FooterNav from "./components/FooterNav"; // добавь импорт

export default function App() {
  const [showWelcome, setShowWelcome] = useState(false);
  // const [userId, setUserId] = useState(null);
  const [telegramId, setTelegramId] = useState(null);
  const [theme, setTheme] = useState('dark');

  // useEffect(() => {
  //   // Показывать только при первом входе (можно использовать localStorage)
  //   if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
  //     setUserId(window.Telegram.WebApp.initDataUnsafe.user.id);
  //   }
    
  //   if (!localStorage.getItem("agreedToTerms")) {
  //     setShowWelcome(true);
  //   }
  // }, []);
  useEffect(() => {
    setTelegramId(getTelegramId());
    if (!localStorage.getItem("agreedToTerms")) {
      setShowWelcome(true);
    }
    
    // Определяем тему Telegram
    const tg = window.Telegram?.WebApp;
    console.log('Telegram WebApp:', tg);
    
    if (tg) {
      tg.ready();
      
      // Задержка для инициализации
      setTimeout(() => {
        const colorScheme = tg.colorScheme;
        console.log('Color scheme:', colorScheme);
        const isDark = colorScheme === 'dark';
        const newTheme = isDark ? 'dark' : 'peach';
        console.log('Setting theme:', newTheme);
        setTheme(newTheme);
        document.body.className = newTheme === 'peach' ? 'peach-theme' : '';
        console.log('Body className:', document.body.className);
      }, 100);
      
      // Слушаем изменения темы
      tg.onEvent('themeChanged', () => {
        const newColorScheme = tg.colorScheme;
        const newIsDark = newColorScheme === 'dark';
        const updatedTheme = newIsDark ? 'dark' : 'peach';
        setTheme(updatedTheme);
        document.body.className = updatedTheme === 'peach' ? 'peach-theme' : '';
        console.log('Theme changed to:', updatedTheme, 'Body class:', document.body.className);
      });
    } else {
      console.log('Telegram WebApp not available');
      setTheme('peach'); // Для тестирования
      document.body.className = 'peach-theme';
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("agreedToTerms", "1");
    setShowWelcome(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {showWelcome && <WelcomeModal onAccept={handleAccept} />}
      <main style={{ flex: 1, filter: showWelcome ? "blur(2px)" : "none" }}>
        <Outlet context={{ telegramId, theme }} />
      </main>
      <FooterNav /> {/* Добавь сюда */}
    </div>
  );
}