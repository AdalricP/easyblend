"use client";

import { useState } from "react";
import Wordmark from "../_components/Wordmark";

export default function RecoverPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong.");
      else setSent(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="card">
        <Wordmark />
        <h1>Check your inbox.</h1>
        <p className="lede">
          If <span className="name">{email}</span> has any easyblend pages, we just emailed
          the private manage link{`${""}`}(s) to it. Don&apos;t forget to bookmark them this
          time 😉
        </p>
        <a className="btn" href="/">Back home</a>
      </div>
    );
  }

  return (
    <div className="wrap">
      <Wordmark />
      <div className="hero">
        <h1>Lost your manage link?</h1>
        <p className="lede">
          Enter the email you signed up with and we&apos;ll send over the private manage
          link for every page tied to it.
        </p>
      </div>

      <form className="panel" onSubmit={submit}>
        {error && <div className="error">{error}</div>}
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
        <button className="btn block" type="submit" disabled={busy}>
          {busy ? "Sending…" : "Email me my links"}
        </button>
      </form>

      <p className="footnote">
        <a href="/">← Back to easyblend</a>
      </p>
    </div>
  );
}
