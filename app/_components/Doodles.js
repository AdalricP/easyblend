// Hand-drawn music/funky doodles scattered in the page margins. Purely
// decorative: fixed behind content, non-interactive, hidden for reduced motion
// folks via CSS. Stroke-based so they read as sketched, not clip-art.
export default function Doodles() {
  const ink = "#211E1C";
  const coral = "#FF5A3C";
  const mustard = "#F5B23D";
  const blue = "#2E7DD1";
  const green = "#3FA34D";
  const s = { fill: "none", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" };

  return (
    <div className="doodles" aria-hidden="true">
      {/* squiggle */}
      <span className="doodle d1">
        <svg viewBox="0 0 90 28" width="90" height="28">
          <path d="M3 16 Q 14 2 25 16 T 47 16 T 69 16 T 87 14" stroke={coral} {...s} />
        </svg>
      </span>

      {/* sparkle star */}
      <span className="doodle d2">
        <svg viewBox="0 0 44 44" width="44" height="44">
          <path
            d="M22 2C24 16 28 20 42 22C28 24 24 28 22 42C20 28 16 24 2 22C16 20 20 16 22 2Z"
            fill={mustard}
            stroke={ink}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {/* eighth note */}
      <span className="doodle d3">
        <svg viewBox="0 0 44 54" width="40" height="50">
          <path d="M16 42 V10 L34 5 V14 L16 19" stroke={blue} {...s} />
          <ellipse cx="10" cy="42" rx="7.5" ry="5.5" fill={blue} />
        </svg>
      </span>

      {/* vinyl record */}
      <span className="doodle d4">
        <svg viewBox="0 0 56 56" width="56" height="56">
          <circle cx="28" cy="28" r="24" stroke={ink} strokeWidth="2.5" fill="none" />
          <circle cx="28" cy="28" r="8" stroke={ink} strokeWidth="2.5" fill="none" />
          <circle cx="28" cy="28" r="2.6" fill={coral} />
        </svg>
      </span>

      {/* loopy spiral */}
      <span className="doodle d5">
        <svg viewBox="0 0 50 44" width="50" height="44">
          <path
            d="M4 30C4 10 32 8 32 26C32 40 12 40 12 28C12 20 24 20 23 28"
            stroke={green}
            {...s}
          />
        </svg>
      </span>

      {/* headphones */}
      <span className="doodle d6">
        <svg viewBox="0 0 64 52" width="60" height="48">
          <path d="M9 34 V27 a23 23 0 0 1 46 0 V34" stroke={ink} {...s} />
          <rect x="4" y="31" width="11" height="17" rx="4.5" fill={coral} stroke={ink} strokeWidth="2" />
          <rect x="49" y="31" width="11" height="17" rx="4.5" fill={coral} stroke={ink} strokeWidth="2" />
        </svg>
      </span>

      {/* equalizer bars */}
      <span className="doodle d7">
        <svg viewBox="0 0 46 40" width="46" height="40">
          <rect x="2" y="16" width="8" height="24" rx="4" fill={coral} />
          <rect x="14" y="6" width="8" height="34" rx="4" fill={mustard} />
          <rect x="26" y="20" width="8" height="20" rx="4" fill={blue} />
          <rect x="38" y="10" width="8" height="30" rx="4" fill={green} />
        </svg>
      </span>

      {/* heart */}
      <span className="doodle d8">
        <svg viewBox="0 0 36 32" width="34" height="30">
          <path
            d="M18 29C2 19 6 4 18 12C30 4 34 19 18 29Z"
            fill="none"
            stroke={coral}
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}
