import TrackUploader from '../components/TrackUploader';
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, User } from 'lucide-react';
// import FooterNav from '../components/FooterNav';


export default function AddTrack() {
  const location = useLocation();

  const navBtnStyle = (active) => ({
    background: active
      ? "linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)"
      : "#232526",
    color: "#fff",
    boxShadow: active
      ? "0 0 12px #6a82fb88"
      : "0 0 8px #fc5c7d44",
    border: active
      ? "none"
      : "1.5px solid #fc5c7d88",
    padding: "10px 18px",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "1.25em",
    cursor: "pointer",
    transition: "box-shadow 0.2s, background 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 40 }}>
      <div
        style={{
          background: "rgba(30,32,40,0.95)",
          padding: 32,
          borderRadius: 22,
          boxShadow: "0 4px 32px 0 rgba(106,130,251,0.25), 0 1.5px 8px 0 #fc5c7d44",
          color: "#fff",
          border: "1.5px solid #6a82fb33",
          width: 340,
          maxWidth: "95vw",
          marginBottom: 32,
        }}
      >
        <h2 style={{
          fontSize: "1.4em",
          fontWeight: 700,
          marginBottom: 18,
          letterSpacing: "0.01em",
          color: "#fff",
          textShadow: "0 2px 12px #6a82fb66",
          textAlign: "center"
        }}>
          Загрузить трек
        </h2>
        <TrackUploader />
      </div>
      {/* <div style={{ display: "flex", gap: 24, marginTop: 10 }}>
        <FooterNav />
      </div> */}
    </div>
  );
}