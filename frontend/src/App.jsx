import { Outlet } from "react-router-dom";
import FooterNav from "./components/FooterNav";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <main className="p-4 flex-1">
        <Outlet />
      </main>
      <FooterNav />
    </div>
  );
}
