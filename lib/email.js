// Email via Resend. When RESEND_API_KEY is unset it logs and no-ops, so local
// dev works without an email account. Never throws — a failed email must not
// break a redirect.
let resend;

async function getClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resend) {
    const { Resend } = await import("resend");
    resend = new Resend(key);
  }
  return resend;
}

const fromAddress = () =>
  process.env.EMAIL_FROM || "easyblend <onboarding@resend.dev>";

export async function sendRefillEmail({ to, handle, manageUrl }) {
  const client = await getClient();
  if (!client) {
    console.warn(`[email] RESEND_API_KEY not set — skipping refill email to ${to}`);
    return false;
  }
  try {
    const { error } = await client.emails.send({
      from: fromAddress(),
      to,
      subject: "Your easyblend is out of blends 🫗",
      text:
        `Heads up — someone just claimed the last Spotify Blend invite on your easyblend page (/${handle}).\n\n` +
        `Add more invites so new visitors keep getting a fresh blend:\n${manageUrl}\n\n— easyblend`,
      html:
        `<div style="font-family:ui-monospace,Menlo,monospace;font-size:15px;color:#1a1714;line-height:1.6">` +
        `<p>Heads up — someone just claimed the <strong>last</strong> Spotify Blend invite on your easyblend page <code>/${handle}</code>.</p>` +
        `<p>Add more invites so new visitors keep getting a fresh blend:</p>` +
        `<p><a href="${manageUrl}" style="color:#1a1714">Refill your blends →</a></p>` +
        `<p style="color:#8a7f76">— easyblend</p></div>`,
    });
    if (error) {
      console.error("[email] refill send failed:", error.message || error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] refill send threw:", e?.message || e);
    return false;
  }
}

// Emails the private manage link(s) for every page registered to `to`. Only
// ever sent to the address that owns the pages, so tokens never leak elsewhere.
export async function sendRecoveryEmail({ to, pages }) {
  const client = await getClient();
  if (!client) {
    console.warn(`[email] RESEND_API_KEY not set — skipping recovery email to ${to}`);
    return false;
  }
  const textList = pages.map((p) => `• /${p.handle}\n  ${p.manageUrl}`).join("\n\n");
  const htmlList = pages
    .map(
      (p) =>
        `<li style="margin-bottom:10px"><code>/${p.handle}</code><br>` +
        `<a href="${p.manageUrl}" style="color:#1ed760">${p.manageUrl}</a></li>`
    )
    .join("");
  try {
    const { error } = await client.emails.send({
      from: fromAddress(),
      to,
      subject: "Your easyblend manage link" + (pages.length > 1 ? "s" : ""),
      text:
        `Here ${pages.length > 1 ? "are the private manage links" : "is the private manage link"} ` +
        `for the easyblend page${pages.length > 1 ? "s" : ""} registered to this email.\n` +
        `Anyone with ${pages.length > 1 ? "a link" : "this link"} can edit ${pages.length > 1 ? "that page" : "the page"}, so keep ${pages.length > 1 ? "them" : "it"} private.\n\n` +
        `${textList}\n\n— easyblend`,
      html:
        `<div style="font-family:ui-monospace,Menlo,monospace;font-size:15px;color:#eaeaea;background:#121212;padding:18px;border-radius:12px;line-height:1.6">` +
        `<p>Here ${pages.length > 1 ? "are the private manage links" : "is the private manage link"} for the easyblend page${pages.length > 1 ? "s" : ""} registered to this email. Anyone with ${pages.length > 1 ? "a link" : "this link"} can edit it — keep ${pages.length > 1 ? "them" : "it"} private.</p>` +
        `<ul style="list-style:none;padding:0">${htmlList}</ul>` +
        `<p style="color:#b3b3b3">— easyblend</p></div>`,
    });
    if (error) {
      console.error("[email] recovery send failed:", error.message || error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] recovery send threw:", e?.message || e);
    return false;
  }
}
