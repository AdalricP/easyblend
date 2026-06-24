"use client";

import { useEffect, useState } from "react";

export default function Interstitial({ handle }) {
  const [state, setState] = useState("loading"); // loading | empty | error
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/pages/${encodeURIComponent(handle)}/next`, {
          method: "POST",
        });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.url) {
          setUrl(data.url);
          setTimeout(() => window.location.replace(data.url), 650);
        } else {
          setState("empty");
        }
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [handle]);

  if (state === "empty") {
    return (
      <>
        <h1>All blends claimed.</h1>
        <p className="lede">
          Every invite on this page has been used. The owner&apos;s been emailed to add
          more — check back soon.
        </p>
      </>
    );
  }

  if (state === "error") {
    return (
      <>
        <h1>Something went wrong.</h1>
        <p className="lede">Please refresh to try again.</p>
      </>
    );
  }

  return (
    <>
      <div className="spinner" />
      <h1>Opening a fresh blend…</h1>
      <p className="lede">Taking you to Spotify.</p>
      {url && (
        <a className="btn" href={url}>
          Open Spotify
        </a>
      )}
    </>
  );
}
