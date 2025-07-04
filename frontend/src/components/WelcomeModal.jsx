import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

const AGREEMENT_PDF_URL = "https://example.com/user-agreement.pdf"; // замени на свою ссылку

export default function WelcomeModal({ onAccept }) {
  const [checkedAgreement, setCheckedAgreement] = useState(false);
  const [checkedPersonal, setCheckedPersonal] = useState(false);
  const controls = useAnimation();

  // Блокируем скролл под модалкой
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div style={{
      position: "fixed",
      zIndex: 1000,
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(30,32,40,0.92)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#232526",
        borderRadius: 18,
        boxShadow: "0 4px 32px #6a82fb55",
        padding: 32,
        maxWidth: 380,
        width: "90vw",
        color: "#fff",
        textAlign: "center"
      }}>
        <h2 style={{ marginBottom: 18, fontWeight: 700, fontSize: "1.3em" }}>
          Добро пожаловать!
        </h2>
        <div style={{ textAlign: "left", marginBottom: 18, fontSize: "1em" }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={checkedAgreement}
              onChange={e => setCheckedAgreement(e.target.checked)}
              style={{ marginTop: 2 }}
            />
            <span>
              Я ознакомился и принимаю&nbsp;
              <a
                href={AGREEMENT_PDF_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#6a82fb", textDecoration: "underline" }}
              >
                Пользовательское соглашение
              </a>
            </span>
          </label>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <input
              type="checkbox"
              checked={checkedPersonal}
              onChange={e => setCheckedPersonal(e.target.checked)}
              style={{ marginTop: 2 }}
            />
            <span>
              Я даю согласие на обработку моих персональных данных
            </span>
          </label>
        </div>
        <button
          style={{
            background: (checkedAgreement && checkedPersonal)
              ? "linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)"
              : "#444",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px 0",
            width: "100%",
            fontWeight: "bold",
            fontSize: "1.1em",
            cursor: (checkedAgreement && checkedPersonal) ? "pointer" : "not-allowed",
            opacity: (checkedAgreement && checkedPersonal) ? 1 : 0.6,
            boxShadow: "0 0 12px #6a82fb88",
            marginTop: 10
          }}
          disabled={!(checkedAgreement && checkedPersonal)}
          onClick={onAccept}
        >
          Начать
        </button>
      </div>
    </div>
  );
}