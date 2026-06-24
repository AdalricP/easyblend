"use client";

import { useEffect, useState } from "react";
import Wordmark from "../_components/Wordmark";

export default function ManagePage() {
  const [creds, setCreds] = useState(null); // { u, token }
  const [email, setEmail] = useState("");
  const [links, setLinks] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const u = qs.get("u");
    const token = qs.get("token");
    if (!u || !token) {
      setStatus("error");
      setError("This manage link is missing its username or token.");
      return;
    }
    setCreds({ u, token });
    (async () => {
      try {
        const res = await fetch(
          `/api/pages/${encodeURIComponent(u)}?token=${encodeURIComponent(token)}`
        );
        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          setError(data.error || "Couldn't load this page.");
          return;
        }
        setEmail(data.email || "");
        setLinks((data.links || []).join("\n"));
        setRemaining(data.remaining || 0);
        setStatus("ready");
      } catch {
        setStatus("error");
        setError("Network error — please try again.");
      }
    })();
  }, []);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch(`/api/pages/${encodeURIComponent(creds.u)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: creds.token, email, links }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't save.");
      } else {
        setRemaining(data.remaining ?? remaining);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="card">
        <Wordmark />
        <div className="spinner" />
        <p className="lede">Loading your page…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="card">
        <Wordmark />
        <h1>Can&apos;t open this.</h1>
        <p className="lede">{error}</p>
        <a className="btn" href="/">Back to easyblend</a>
      </div>
    );
  }

  return (
    <div className="wrap">
      <Wordmark />
      <div className="hero">
        <h1>Manage {creds.u}</h1>
        <p className="lede">
          <span className="mono">
            <a href={`/${creds.u}`} target="_blank" rel="noreferrer">/{creds.u} ↗</a>
          </span>
          {" · "}
          <strong>{remaining}</strong> blend{remaining === 1 ? "" : "s"} left
        </p>
      </div>

      <form className="panel" onSubmit={save}>
        {error && <div className="error">{error}</div>}
        {remaining === 0 && (
          <div className="warn">Your pool is empty — add invites below so visitors get a fresh blend.</div>
        )}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@email.com"
            value={email}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="hint">Where we send the &quot;refill your blends&quot; notice.</p>
        </div>

        <div className="field">
          <label htmlFor="links">Spotify Blend invite links</label>
          <textarea
            id="links"
            value={links}
            onChange={(e) => setLinks(e.target.value)}
          />
          <p className="hint">
            One link per line. These are the invites still waiting to be handed out — used
            ones are already gone. Paste fresh ones to refill.
          </p>
        </div>

        <button className="btn block" type="submit" disabled={busy}>
          {busy ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
