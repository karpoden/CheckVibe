import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import WelcomeModal from "./components/WelcomeModal";
import { getTelegramId } from "./getTelegramId";
import FooterNav from "./components/FooterNav"; // добавь импорт

export default function App() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [telegramId, setTelegramId] = useState(null);

  useEffect(() => {
    // Инициализация Telegram WebApp и раскрытие на весь экран
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand(); // <-- Делает full screen
    }

    setTelegramId(getTelegramId());

    if (!localStorage.getItem("agreedToTerms")) {
      setShowWelcome(true);
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
        <Outlet context={{ telegramId }} />
      </main>
      <FooterNav />
    </div>
  );
}