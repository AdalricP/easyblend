// Tampermonkey mark — its two circles, in white, since the logo's black
// squircle would disappear against the black button.
export default function TampermonkeyLogo() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="8.7" cy="14.8" r="4.15" fill="#fff" />
      <circle cx="16.2" cy="14.8" r="4.15" fill="#fff" />
    </svg>
  );
}
