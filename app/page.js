"use client";

import { useEffect, useState } from "react";
import Logo from "./_components/Logo";

export default function CreatePage() {
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [links, setLinks] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [origin, setOrigin] = useState("");

  // Prefill the username if someone arrived via a "claim this" link.
  useEffect(() => {
    setOrigin(window.location.origin);
    const claim = new URLSearchParams(window.location.search).get("claim");
    if (claim) setHandle(claim);
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, displayName, links }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <div className="wrap">
        <Logo />
        <Success result={result} origin={origin} />
      </div>
    );
  }

  return (
    <div className="wrap">
      <Logo />
      <div className="hero">
        <h1>One link to a fresh blend.</h1>
        <p className="lede">
          Claim your BlendBox, drop in your Spotify Blend invites, and share a single
          link. Every visitor gets handed a fresh blend with you — automatically.
        </p>
      </div>

      <form className="panel" onSubmit={submit}>
        {error && <div className="error">{error}</div>}

        <div className="field">
          <label htmlFor="handle">Your BlendBox link</label>
          <div className="url-prefix">
            <span>{(origin || "blendbox.xyz").replace(/^https?:\/\//, "")}/</span>
            <input
              id="handle"
              type="text"
              placeholder="yourname"
              value={handle}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              onChange={(e) => setHandle(e.target.value.replace(/\s/g, ""))}
            />
          </div>
          <p className="hint">Letters, numbers, dot, dash or underscore. 2–30 characters.</p>
        </div>

        <div className="field">
          <label htmlFor="display">Display name <span style={{ fontWeight: 400 }}>(optional)</span></label>
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
            placeholder={"https://spotify.link/abc123\nhttps://spotify.link/def456\nhttps://spotify.link/ghi789"}
            value={links}
            onChange={(e) => setLinks(e.target.value)}
          />
          <p className="hint">
            One link per line. In Spotify, open your Blend → <strong>Invite</strong> →
            copy link, and paste a batch here. Visitors are rotated through the pool so
            each gets a fresh one.
          </p>
        </div>

        <button className="btn block" type="submit" disabled={busy}>
          {busy ? "Creating…" : "Create my BlendBox"}
        </button>
      </form>

      <p className="footnote">
        Already have one? Use the private manage link you got when you created it.
      </p>
    </div>
  );
}

function Success({ result, origin }) {
  const shareUrl = `${origin}${result.url}`;
  const manageUrl = `${origin}${result.manageUrl}`;
  return (
    <div className="panel">
      <h1 style={{ fontSize: 24 }}>🎉 You're live</h1>
      <p className="lede" style={{ marginBottom: 18 }}>
        Share this link anywhere — it hands out a fresh blend each time.
      </p>

      <label>Your public link</label>
      <CopyBox value={shareUrl} />

      <label style={{ marginTop: 18 }}>Private manage link — save this!</label>
      <CopyBox value={manageUrl} muted />
      <div className="warn">
        ⚠️ This is the only way to edit or add links later. We can't recover it — bookmark it now.
      </div>

      <div className="row">
        <a className="btn" href={result.url} target="_blank" rel="noreferrer">
          Test redirect ↗
        </a>
        <a className="btn btn-ghost" href={result.manageUrl}>
          Manage links
        </a>
      </div>
    </div>
  );
}

function CopyBox({ value, muted }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard blocked — user can select manually */
    }
  }
  return (
    <div className={`copybox ${muted ? "muted" : ""}`}>
      <code>{value}</code>
      <button type="button" className="copy-btn" onClick={copy}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
