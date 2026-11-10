import { NavLink, Link } from "react-router-dom";
import Icon from "./Icons.jsx";
import { useProgress } from "../lib/progress.jsx";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/lectures", label: "Lectures" },
  { to: "/exam", label: "Practice Exam" },
  { to: "/cheatsheet", label: "Cheat Sheet" },
  { to: "/glossary", label: "Glossary" },
];

export default function Navbar() {
  const { stats, theme, toggleTheme } = useProgress();
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="logo">
          <span className="logo-mark">
            <Icon name="database" size={18} />
          </span>
          CS2030 Prep
        </Link>
        <div className="nav-links">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              {l.label}
            </NavLink>
          ))}
        </div>
        <div className="nav-right">
          <span className="progress-pill" title="Overall completion across all lectures">
            <Icon name="target" size={14} />
            <span>{stats.overall}%</span>
            <span className="mini-bar bar thin">
              <span className="bar-fill" style={{ width: `${stats.overall}%` }} />
            </span>
          </span>
          <button
            className="icon-btn"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle dark mode"
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} size={17} />
          </button>
        </div>
      </div>
    </nav>
  );
}
