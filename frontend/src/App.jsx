import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import WelcomeModal from "./components/WelcomeModal";

export default function App() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Показывать только при первом входе (можно использовать localStorage)
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      setUserId(window.Telegram.WebApp.initDataUnsafe.user.id);
    }
    
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
        <Outlet />
      </main>
    </div>
  );
}