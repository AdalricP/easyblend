import { MAX_LINKS } from "@/lib/util";

const truncate = (s) => (s.length > 52 ? s.slice(0, 52) + "…" : s);

// Presentational: shows how many pasted lines are valid Spotify links, flags
// the over-limit case, and lists the ones that aren't Spotify links.
export default function LinkStatus({ valid, invalid, show }) {
  if (!show) return null;
  const over = valid.length > MAX_LINKS;
  return (
    <div className="linkstatus">
      <span className={over ? "ls-warn" : "ls-ok"}>
        ✓ {valid.length} Spotify link{valid.length === 1 ? "" : "s"}
        {over ? ` — max ${MAX_LINKS}` : ""}
      </span>
      {over && (
        <div className="ls-bad">
          <strong>Remove {valid.length - MAX_LINKS} — a page holds at most {MAX_LINKS} links.</strong>
        </div>
      )}
      {invalid.length > 0 && (
        <div className="ls-bad">
          <strong>✕ {invalid.length} not a Spotify link — remove to continue:</strong>
          <ul>
            {invalid.slice(0, 6).map((l, i) => (
              <li key={i}>{truncate(l)}</li>
            ))}
          </ul>
          {invalid.length > 6 && <div>…and {invalid.length - 6} more</div>}
        </div>
      )}
    </div>
  );
}
