"use client";

import { useEffect, useState } from "react";
import Wordmark from "./_components/Wordmark";
import LinkStatus from "./_components/LinkStatus";
import { parseLinks, isValidHandle, MAX_LINKS } from "@/lib/util";

export default function CreatePage() {
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [links, setLinks] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [origin, setOrigin] = useState("");
  const [spots, setSpots] = useState(null);

  // Prefill the username if someone arrived via a "claim this" link.
  useEffect(() => {
    setOrigin(window.location.origin);
    const claim = new URLSearchParams(window.location.search).get("claim");
    if (claim) setHandle(claim);
    fetch("/api/spots")
      .then((r) => r.json())
      .then(setSpots)
      .catch(() => {});
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, email, links }),
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

  // Smart paste: drop the whole "X invited you to a Spotify Blend <link>" string
  // in and we keep just the link(s), appended one per line. Paste 10× and done.
  function onLinksPaste(e) {
    const text = e.clipboardData.getData("text") || "";
    const found = text.match(/https?:\/\/(?:spotify\.link|open\.spotify\.com)\/[^\s"'<>]+/gi);
    if (!found) return; // nothing Spotify-shaped — let the normal paste happen
    e.preventDefault();
    setLinks((prev) => {
      const base = prev.replace(/\s+$/, "");
      return (base ? base + "\n" : "") + found.join("\n") + "\n";
    });
  }

  const parsed = parseLinks(links);
  const linksReady =
    parsed.valid.length > 0 && parsed.valid.length <= MAX_LINKS && parsed.invalid.length === 0;
  const handleBad = handle.length > 0 && !isValidHandle(handle);
  const full = spots?.full;

  if (result) {
    return (
      <div className="wrap">
        <Wordmark />
        <Success result={result} origin={origin} />
      </div>
    );
  }

  return (
    <div className="wrap">
      <Wordmark />
      <div className="hero">
        <div className={`spots${spots ? " ready" : ""}`}>
          {spots ? `${spots.remaining}/${spots.max} spots left` : ""}
        </div>
      </div>

      <form className="panel" onSubmit={submit}>
        {error && <div className="error">{error}</div>}

        <div className="field">
          <label htmlFor="handle">Your easyblend link</label>
          <div className="url-prefix">
            <span>{(origin || "easyblend.xyz").replace(/^https?:\/\//, "")}/</span>
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
          {handleBad && (
            <p className="field-err">Letters, numbers, dot, dash or underscore · 2–30 characters</p>
          )}
        </div>

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
        </div>

        <div className="field">
          <label htmlFor="links">Spotify Blend invite links</label>
          <textarea
            id="links"
            placeholder={"https://spotify.link/abc123\nhttps://spotify.link/def456\nhttps://spotify.link/ghi789"}
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            onPaste={onLinksPaste}
          />
          <a
            className="blend-link"
            href="https://open.spotify.com/blend/invitation"
            target="_blank"
            rel="noreferrer"
          >
            Make a Spotify Blend ↗
          </a>
          <LinkStatus
            valid={parsed.valid}
            invalid={parsed.invalid}
            show={links.trim().length > 0}
          />
        </div>

        <button
          className="btn block"
          type="submit"
          disabled={busy || !linksReady || full || !isValidHandle(handle)}
        >
          {busy ? "Creating…" : full ? "All spots taken" : "Create my page"}
        </button>
      </form>

      <p className="footnote">
        <a href="/recover">Forgor account details</a>
      </p>

      <p className="made-note">
        <a href="/meme.jpg">
          I was trying to get to 100 blends and it was annoying to copy the link everytime so
          I just made this
        </a>
      </p>
    </div>
  );
}

function Success({ result, origin }) {
  const shareUrl = `${origin}${result.url}`;
  const manageUrl = `${origin}${result.manageUrl}`;
  return (
    <div className="panel">
      <h1 style={{ fontSize: 24 }}>You&apos;re live.</h1>
      <p className="lede" style={{ marginBottom: 18 }}>
        Share this link anywhere — it hands out a fresh blend each time, until the pool
        runs out.
      </p>

      <label>Your public link</label>
      <CopyBox value={shareUrl} />

      <label style={{ marginTop: 18 }}>Private manage link — save this!</label>
      <CopyBox value={manageUrl} muted />
      <div className="warn">
        This is the only way to edit or add links later. We can&apos;t recover it — bookmark it now.
      </div>

      <div className="row">
        <a className="btn block" href={result.manageUrl}>
          Manage links
        </a>
      </div>
      <p className="hint" style={{ textAlign: "center", marginTop: 12 }}>
        Heads up: opening your public link uses one invite.
      </p>
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
