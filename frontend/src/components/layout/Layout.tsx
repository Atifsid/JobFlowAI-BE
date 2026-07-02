import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import BottomTabs from "./BottomTabs";

export default function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
      <BottomTabs />
    </div>
  );
}
