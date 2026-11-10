import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, Link, useLocation } from "react-router-dom";
import Icon from "./Icons.jsx";
import { useProgress } from "../lib/progress.jsx";
import { lectures } from "../data/lectures/index.js";

const links = [
  { to: "/", label: "Home", end: true, icon: "home" },
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/lectures", label: "Lectures", icon: "book" },
  { to: "/playground", label: "Compiler", icon: "terminal" },
  { to: "/exam", label: "Practice Exam", icon: "target" },
  { to: "/cheatsheet", label: "Cheat Sheet", icon: "file" },
  { to: "/glossary", label: "Glossary", icon: "book" },
];

export default function Navbar() {
  const { stats, theme, toggleTheme } = useProgress();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [lectOpen, setLectOpen] = useState(pathname.startsWith("/lectures/"));

  // close the drawer whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // lock body scroll + close on Escape while the drawer is open
  useEffect(() => {
    document.body.classList.toggle("drawer-lock", open);
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onLecturesIndex = pathname === "/lectures";

  return (
    <>
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
            <button
              className="icon-btn nav-burger"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              title="Menu"
            >
              <Icon name="menu" size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* side drawer with expandable lectures menu — portaled to <body> so no
          ancestor transform can ever disturb its position:fixed behavior */}
      {createPortal(
        <>
          <div
            className={`drawer-backdrop${open ? " show" : ""}`}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className={`drawer${open ? " open" : ""}`} aria-hidden={!open} aria-label="Site menu">
        <div className="drawer-head">
          <span className="drawer-title">
            <span className="logo-mark" style={{ width: 30, height: 30, borderRadius: 10 }}>
              <Icon name="database" size={15} />
            </span>
            Menu
          </span>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close menu">
            <Icon name="x" size={17} />
          </button>
        </div>

        <div className="drawer-links">
          <NavLink to="/" end className={({ isActive }) => `drawer-link${isActive ? " active" : ""}`}>
            <span className="d-icon"><Icon name="home" size={17} /></span> Home
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `drawer-link${isActive ? " active" : ""}`}>
            <span className="d-icon"><Icon name="dashboard" size={17} /></span> Dashboard
          </NavLink>

          {/* expandable lectures section */}
          <button
            className={`drawer-acc${lectOpen ? " open" : ""}`}
            onClick={() => setLectOpen((v) => !v)}
            aria-expanded={lectOpen}
          >
            <span className="d-icon"><Icon name="book" size={17} /></span>
            Lectures
            <span className="count-chip">{lectures.length}</span>
            <span className="chev"><Icon name="chevron-down" size={16} /></span>
          </button>
          <div className={`drawer-sub${lectOpen ? " open" : ""}`}>
            <NavLink
              to="/lectures"
              end
              className={() => `drawer-sub-link${onLecturesIndex ? " active" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <span className="sub-num"><Icon name="list" size={13} /></span>
              All lectures
            </NavLink>
            {lectures.map((l) => (
              <NavLink key={l.slug} to={`/lectures/${l.slug}`} className="drawer-sub-link">
                <span className="sub-num">{l.num}</span>
                <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {l.title}
                </span>
              </NavLink>
            ))}
          </div>

          <NavLink to="/playground" className={({ isActive }) => `drawer-link${isActive ? " active" : ""}`}>
            <span className="d-icon"><Icon name="terminal" size={17} /></span> Compiler
          </NavLink>
          <NavLink to="/exam" className={({ isActive }) => `drawer-link${isActive ? " active" : ""}`}>
            <span className="d-icon"><Icon name="target" size={17} /></span> Practice Exam
          </NavLink>
          <NavLink to="/cheatsheet" className={({ isActive }) => `drawer-link${isActive ? " active" : ""}`}>
            <span className="d-icon"><Icon name="file" size={17} /></span> Cheat Sheet
          </NavLink>
          <NavLink to="/glossary" className={({ isActive }) => `drawer-link${isActive ? " active" : ""}`}>
            <span className="d-icon"><Icon name="book" size={17} /></span> Glossary
          </NavLink>
        </div>

        <div className="drawer-foot">
          <div className="bar-label" style={{ marginTop: 0 }}>
            <span>Overall progress</span>
            <span>{stats.overall}%</span>
          </div>
          <div className="bar thin" style={{ marginTop: 6 }}>
            <div className="bar-fill" style={{ width: `${stats.overall}%` }} />
          </div>
        </div>
      </aside>
        </>,
        document.body
      )}
    </>
  );
}
