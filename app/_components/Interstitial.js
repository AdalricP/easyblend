"use client";

import { useEffect } from "react";

export default function Interstitial({ url, who }) {
  useEffect(() => {
    const t = setTimeout(() => window.location.replace(url), 900);
    return () => clearTimeout(t);
  }, [url]);

  return (
    <>
      <div className="spinner" />
      <h1>Opening your blend…</h1>
      <p className="lede">
        Taking you to a fresh blend with <span className="name">{who}</span> on Spotify.
      </p>
      <a className="btn" href={url}>Open Spotify</a>
    </>
  );
}
