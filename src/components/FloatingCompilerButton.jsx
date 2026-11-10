import { Link, useLocation } from "react-router-dom";
import Icon from "./Icons.jsx";

// Floating button pinned to the right edge (vertical middle) on every page
// except the playground itself. Opens the Compiler for free practice.
export default function FloatingCompilerButton() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/playground")) return null;
  return (
    <Link
      to="/playground"
      className="fab"
      title="Open the Compiler — practice SQL & Python"
      aria-label="Open the Compiler"
    >
      <Icon name="terminal" size={22} strokeWidth={2.1} />
    </Link>
  );
}
