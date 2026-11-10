import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Splash from "./components/Splash.jsx";
import AmbientBackground from "./components/AmbientBackground.jsx";
import FloatingCompilerButton from "./components/FloatingCompilerButton.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Lectures from "./pages/Lectures.jsx";
import LecturePage from "./pages/LecturePage.jsx";
import Exam from "./pages/Exam.jsx";
import CheatSheet from "./pages/CheatSheet.jsx";
import GlossaryPage from "./pages/GlossaryPage.jsx";
import Playground from "./pages/Playground.jsx";

export default function App() {
  const [revealed, setRevealed] = useState(false); // app starts animating in under the splash
  const [splashGone, setSplashGone] = useState(false); // splash unmounts after its exit animation
  const location = useLocation();

  // no scrollbar while the splash screen is up
  useEffect(() => {
    document.body.classList.toggle("splash-lock", !revealed);
    return () => document.body.classList.remove("splash-lock");
  }, [revealed]);

  return (
    <>
      <AmbientBackground />
      {!splashGone && (
        <Splash onReveal={() => setRevealed(true)} onDone={() => setSplashGone(true)} />
      )}
      <div className={revealed ? "app-reveal" : "app-hidden"}>
        <Navbar />
        {/* keyed by pathname so each navigation replays the page transition */}
        <div className="route-shell" key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lectures" element={<Lectures />} />
            <Route path="/lectures/:slug" element={<LecturePage />} />
            <Route path="/exam" element={<Exam />} />
            <Route path="/cheatsheet" element={<CheatSheet />} />
            <Route path="/glossary" element={<GlossaryPage />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <FloatingCompilerButton />
        <footer className="footer">
          <div className="container">
            Built for <b>CS2030 · Database Systems</b> — Shaggar Institute of Technology ·
            No account needed: your progress is stored in this browser only.
          </div>
        </footer>
      </div>
    </>
  );
}
