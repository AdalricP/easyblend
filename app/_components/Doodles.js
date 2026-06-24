// Minimal hand-drawn squiggles scattered in the margins. Abstract strokes only
// — no icons or emojis. Fixed behind content, non-interactive.
export default function Doodles() {
  const gray = "#d7d7d7";
  const green = "#1db954";
  const s = { fill: "none", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" };

  return (
    <div className="doodles" aria-hidden="true">
      {/* long gentle wave */}
      <span className="doodle d1">
        <svg viewBox="0 0 120 20" width="120" height="20">
          <path d="M3 10 Q 18 1 33 10 T 63 10 T 93 10 T 117 9" stroke={gray} {...s} />
        </svg>
      </span>

      {/* loop-de-loop */}
      <span className="doodle d2">
        <svg viewBox="0 0 80 30" width="80" height="30">
          <path d="M3 18 C 14 0 30 0 30 14 C 30 24 18 24 20 14 C 22 4 40 4 48 18 C 54 28 70 26 77 12"
            stroke={green} {...s} />
        </svg>
      </span>

      {/* spiral */}
      <span className="doodle d3">
        <svg viewBox="0 0 44 44" width="44" height="44">
          <path d="M22 22 m0 0 C 18 22 18 16 24 16 C 32 16 32 28 22 28 C 10 28 10 12 24 12 C 38 12 38 32 22 34"
            stroke={gray} {...s} />
        </svg>
      </span>

      {/* tight zigzag wave */}
      <span className="doodle d4">
        <svg viewBox="0 0 96 18" width="96" height="18">
          <path d="M3 9 Q 9 1 15 9 T 27 9 T 39 9 T 51 9 T 63 9 T 75 9 T 87 9 T 93 9" stroke={gray} {...s} />
        </svg>
      </span>

      {/* big open S */}
      <span className="doodle d5">
        <svg viewBox="0 0 50 56" width="50" height="56">
          <path d="M40 6 C 12 10 12 26 38 28 C 64 30 36 52 8 50" stroke={green} {...s} />
        </svg>
      </span>

      {/* short curl */}
      <span className="doodle d6">
        <svg viewBox="0 0 56 28" width="56" height="28">
          <path d="M4 14 C 14 2 22 26 32 14 C 40 4 46 22 52 12" stroke={gray} {...s} />
        </svg>
      </span>

      {/* coil */}
      <span className="doodle d7">
        <svg viewBox="0 0 70 30" width="70" height="30">
          <path d="M4 15 C 6 4 16 4 16 15 C 16 26 26 26 28 15 C 30 4 40 4 40 15 C 40 26 50 26 52 15 C 54 4 64 4 66 14"
            stroke={gray} {...s} />
        </svg>
      </span>

      {/* underline flourish */}
      <span className="doodle d8">
        <svg viewBox="0 0 90 16" width="90" height="16">
          <path d="M3 6 Q 30 16 50 7 T 87 8" stroke={green} {...s} />
        </svg>
      </span>
    </div>
  );
}
