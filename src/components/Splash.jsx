import { useEffect, useState } from "react";
import Icon from "./Icons.jsx";

// Animated splash screen shown once per page load. Click anywhere to skip.
export default function Splash({ onDone }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 1400);
    const t2 = setTimeout(() => onDone(), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`splash${leaving ? " leave" : ""}`}
      onClick={onDone}
      role="status"
      aria-label="Loading CS2030 Prep"
    >
      <div className="splash-inner">
        <div className="splash-mark">
          <Icon name="database" size={44} strokeWidth={2} />
        </div>
        <div className="splash-title">
          CS2030 <em>Prep</em>
        </div>
        <div className="splash-sub">Database Systems · Exam Ready</div>
        <div className="splash-bar">
          <span />
        </div>
      </div>
    </div>
  );
}
