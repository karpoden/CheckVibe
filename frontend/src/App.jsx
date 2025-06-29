import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}