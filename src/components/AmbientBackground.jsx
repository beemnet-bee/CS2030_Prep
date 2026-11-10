// Fixed, animated ambient background: drifting lime orbs + a faint dot grid.
// Pure CSS animations; hidden from assistive tech and print.
export default function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <span className="orb o1" />
      <span className="orb o2" />
      <span className="orb o3" />
    </div>
  );
}
