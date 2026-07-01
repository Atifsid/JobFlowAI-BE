import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div>
      <nav style={{ display: "flex", gap: "1rem", padding: "1rem", borderBottom: "1px solid #ddd" }}>
        <NavLink to="/search">Search</NavLink>
        <NavLink to="/jobs">Jobs</NavLink>
      </nav>
      <main style={{ padding: "1rem" }}>
        <Outlet />
      </main>
    </div>
  );
}
