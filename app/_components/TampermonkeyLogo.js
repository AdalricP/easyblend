// Approximation of the Tampermonkey mark (dark squircle + two pale circles).
// Rendered light so it reads on the black button. Swap for the official SVG
// anytime — drop it in /public and point here.
export default function TampermonkeyLogo() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
      <rect x="1.5" y="1.5" width="21" height="21" rx="6.5" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="9.2" cy="11.4" r="3.5" fill="#fff" />
      <circle cx="15.3" cy="13.4" r="2.4" fill="#fff" />
    </svg>
  );
}
