"use client";

import { useEffect, useState } from "react";
import Wordmark from "./_components/Wordmark";
import LinkStatus from "./_components/LinkStatus";
import { parseLinks } from "@/lib/util";

export default function CreatePage() {
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
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

  const parsed = parseLinks(links);
  const linksReady = parsed.valid.length > 0 && parsed.invalid.length === 0;

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
        <h1>One link to a fresh blend.</h1>
        <p className="lede">
          Claim your page, drop in your Spotify Blend invites, and share a single link.
          Each invite is handed out once — when the pool runs dry we email you to refill.
        </p>
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
          <p className="hint">Letters, numbers, dot, dash or underscore. 2–30 characters.</p>
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
          <p className="hint">We&apos;ll email you when your last invite is claimed so you can refill.</p>
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
            One link per line. In Spotify, open your Blend → <strong>Invite</strong> → copy
            link, and paste a batch here. Each is used once, then removed.
          </p>
          <LinkStatus
            valid={parsed.valid}
            invalid={parsed.invalid}
            show={links.trim().length > 0}
          />
        </div>

        <button className="btn block" type="submit" disabled={busy || !linksReady}>
          {busy ? "Creating…" : "Create my page"}
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
