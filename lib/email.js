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
