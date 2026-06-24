// ==UserScript==
// @name         easyblend · grab blend links
// @namespace    https://easyblend.xyz
// @version      0.4.1
// @description  Grab up to 10 fresh Spotify Blend invite links to paste into easyblend.xyz
// @author       easyblend
// @match        https://open.spotify.com/*
// @match        https://easyblend.xyz/*
// @match        https://*.easyblend.xyz/*
// @icon         https://easyblend.xyz/favicon.ico
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  const VERSION = "0.4.1";

  // ── On easyblend: announce presence so the site can detect the script ──
  if (location.hostname.indexOf("easyblend") !== -1) {
    console.log("[easyblend] userscript v" + VERSION + " active on " + location.hostname);
    try { window.__EASYBLEND_USERSCRIPT__ = VERSION; } catch (e) {}
    try { document.documentElement.setAttribute("data-eb-userscript", VERSION); } catch (e) {}
    try { localStorage.setItem("eb_userscript", VERSION); } catch (e) {}
    const announce = function () {
      try {
        window.dispatchEvent(new CustomEvent("easyblend:userscript", { detail: VERSION }));
      } catch (e) {}
    };
    announce();
    document.addEventListener("DOMContentLoaded", announce);
    return;
  }

  // ── On Spotify's blend invite page: inject the grabber ─────────────────
  const MAX = 10;
  const GAP = 1000; // 1s cooldown between clicks
  const SPOTIFY_LINK = /https?:\/\/(?:spotify\.link|open\.spotify\.com)\/[^\s"'<>]+/i;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function init() {
    console.log("[easyblend] userscript v" + VERSION + " active on the Spotify blend page");
    const panel = document.createElement("div");
    panel.style.cssText =
      "position:fixed;top:16px;right:16px;z-index:99999;width:300px;background:#fff;color:#121212;" +
      "border:1px solid #e4e4e4;border-radius:16px;box-shadow:0 10px 34px rgba(0,0,0,.18);" +
      "font-family:system-ui,-apple-system,sans-serif;padding:16px";
    panel.innerHTML =
      '<div style="font-weight:800;font-size:14px;margin-bottom:10px">easyblend · grab links</div>' +
      '<button id="eb-go" style="width:100%;background:#1db954;color:#000;font-weight:700;border:none;' +
      'border-radius:999px;padding:11px;cursor:pointer;font-size:14px">Grab up to ' + MAX + " links</button>" +
      '<div id="eb-status" style="font-size:12px;color:#6a6a6a;margin-top:10px;line-height:1.4"></div>' +
      '<textarea id="eb-out" readonly style="width:100%;height:122px;margin-top:10px;display:none;' +
      'font-family:ui-monospace,Menlo,monospace;font-size:11px;border:1px solid #ddd;border-radius:10px;padding:8px"></textarea>' +
      '<button id="eb-copy" style="width:100%;margin-top:8px;display:none;background:#121212;color:#fff;' +
      'border:none;border-radius:999px;padding:10px;font-weight:700;cursor:pointer">Copy all</button>';
    document.body.appendChild(panel);

    const status = panel.querySelector("#eb-status");
    const out = panel.querySelector("#eb-out");
    const copyBtn = panel.querySelector("#eb-copy");

    // Spotify's button has no "copy" text — it's an encore primary button
    // (class …button-primary__inner…). Prefer a copy/invite label if present,
    // otherwise fall back to the primary button.
    function findCopyButton() {
      const cands = [...document.querySelectorAll('button,[role="button"],a')];
      const byText = cands.find((el) => {
        const t = (el.getAttribute("aria-label") || el.textContent || "").toLowerCase();
        const d = (el.getAttribute("data-testid") || "").toLowerCase();
        return /copy/.test(t) || /copy/.test(d) || /invite/.test(d);
      });
      if (byText) return byText;
      const inner = document.querySelector('[class*="button-primary__inner"], [class*="button-primary"]');
      if (inner) return inner.closest('button,[role="button"],a') || inner;
      return null;
    }

    function findLinkInDom() {
      for (const inp of document.querySelectorAll("input,textarea")) {
        const m = (inp.value || "").match(SPOTIFY_LINK);
        if (m) return m[0];
      }
      return null;
    }

    async function grab() {
      const seen = new Set();
      const captured = [];

      // Capture whatever Spotify writes to the clipboard on each click — we push
      // the text BEFORE forwarding, so we keep it even if the OS clipboard write
      // is blocked (no user-activation after the first click).
      let origWrite = null;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        origWrite = navigator.clipboard.writeText.bind(navigator.clipboard);
        navigator.clipboard.writeText = function (text) {
          captured.push(String(text));
          return origWrite(text).catch(function () {});
        };
      }
      const onCopy = (e) => {
        try {
          const t = (e.clipboardData || window.clipboardData).getData("text");
          if (t) captured.push(String(t));
        } catch (err) {}
      };
      document.addEventListener("copy", onCopy, true);

      const btn = findCopyButton();
      console.log("[easyblend] copy button:", btn);
      for (let i = 0; i < MAX; i++) {
        status.textContent = "Grabbing " + (i + 1) + "/" + MAX + "…";
        if (btn) {
          btn.click();
          // some encore buttons only react to pointer events
          try {
            btn.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
            btn.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
          } catch (e) {}
        }
        await sleep(GAP);
        const domLink = findLinkInDom();
        if (domLink) captured.push(domLink);
      }

      if (origWrite) navigator.clipboard.writeText = origWrite;
      document.removeEventListener("copy", onCopy, true);
      console.log("[easyblend] captured strings:", captured);

      // strip the "X invited you to a Spotify Blend" text, keep only URLs, dedupe
      for (const c of captured) {
        const m = c.match(SPOTIFY_LINK);
        if (m) seen.add(m[0]);
      }
      const list = [...seen];
      out.value = list.join("\n");
      out.style.display = "block";
      copyBtn.style.display = list.length ? "block" : "none";
      status.textContent = list.length
        ? "Got " + list.length + " link" + (list.length === 1 ? "" : "s") + " — paste them into easyblend."
        : "No links captured — button " + (btn ? "found" : "NOT found") +
          ", saw " + captured.length + " copies. (Check the console.)";
    }

    panel.querySelector("#eb-go").addEventListener("click", grab);
    copyBtn.addEventListener("click", () => {
      out.select();
      document.execCommand("copy");
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy all"), 1500);
    });
  }

  console.log("[easyblend] userscript v" + VERSION + " on Spotify — path: " + location.pathname);
  if (/blend/i.test(location.pathname)) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  } else {
    console.log("[easyblend] not a blend page — panel not injected.");
  }
})();
