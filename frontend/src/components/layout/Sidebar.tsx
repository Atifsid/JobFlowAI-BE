import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/search", label: "Job Search", end: false },
  { to: "/jobs", label: "Tracker", end: false }
];

export default function Sidebar() {
  return (
    <nav className="sidebar">
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) => `sidebar__link${isActive ? " sidebar__link--active" : ""}`}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
