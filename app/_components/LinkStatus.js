const truncate = (s) => (s.length > 52 ? s.slice(0, 52) + "…" : s);

// Presentational: shows how many pasted lines are valid Spotify links and lists
// the ones that aren't. Parent passes the already-parsed { valid, invalid }.
export default function LinkStatus({ valid, invalid, show }) {
  if (!show) return null;
  return (
    <div className="linkstatus">
      <span className="ls-ok">
        ✓ {valid.length} Spotify link{valid.length === 1 ? "" : "s"}
      </span>
      {invalid.length > 0 && (
        <div className="ls-bad">
          <strong>
            ✕ {invalid.length} not a Spotify link — remove to continue:
          </strong>
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
