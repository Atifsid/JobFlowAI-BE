import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/search", label: "Job Search", end: false },
  { to: "/jobs", label: "Tracker", end: false }
];

export default function BottomTabs() {
  return (
    <nav className="bottom-tabs">
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) => (isActive ? "bottom-tabs__link--active" : "")}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
