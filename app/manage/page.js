"use client";

import { useEffect, useState } from "react";
import Logo from "../_components/Logo";

export default function ManagePage() {
  const [creds, setCreds] = useState(null); // { u, token }
  const [displayName, setDisplayName] = useState("");
  const [links, setLinks] = useState("");
  const [visits, setVisits] = useState(0);
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
        const res = await fetch(`/api/pages/${encodeURIComponent(u)}?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          setError(data.error || "Couldn't load this BlendBox.");
          return;
        }
        setDisplayName(data.displayName || "");
        setLinks((data.links || []).join("\n"));
        setVisits(data.visits || 0);
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
        body: JSON.stringify({ token: creds.token, displayName, links }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't save.");
      } else {
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
        <Logo />
        <div className="spinner" />
        <p className="lede">Loading your BlendBox…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="card">
        <Logo />
        <h1>Can&apos;t open this.</h1>
        <p className="lede">{error}</p>
        <a className="btn" href="/">Back to BlendBox</a>
      </div>
    );
  }

  return (
    <div className="wrap">
      <Logo />
      <div className="hero">
        <h1>Manage @{creds.u}</h1>
        <p className="lede">
          Your link: <a className="name" href={`/${creds.u}`} target="_blank" rel="noreferrer">/{creds.u} ↗</a>
          {" · "}{visits} redirect{visits === 1 ? "" : "s"} served
        </p>
      </div>

      <form className="panel" onSubmit={save}>
        {error && <div className="error">{error}</div>}

        <div className="field">
          <label htmlFor="display">Display name</label>
          <input
            id="display"
            type="text"
            placeholder="How your name shows on the redirect screen"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="links">Spotify Blend invite links</label>
          <textarea
            id="links"
            value={links}
            onChange={(e) => setLinks(e.target.value)}
          />
          <p className="hint">
            One link per line. Saving resets the rotation to the top of the list.
          </p>
        </div>

        <button className="btn block" type="submit" disabled={busy}>
          {busy ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
