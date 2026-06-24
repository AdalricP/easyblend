import { NextResponse } from "next/server";
import { getPageByUsername, consumeLink, markNotified, rateLimit } from "@/lib/db";
import { RESERVED } from "@/lib/util";
import { clientIp } from "@/lib/auth";
import { sendRefillEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Pops a single-use link for a real visitor (called client-side so bots /
// link-preview fetchers don't burn invites). Emails the owner once when the
// last link is claimed.
export async function POST(req, { params }) {
  const handle = params.username;
  if (RESERVED.has(handle.toLowerCase()))
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Throttle per IP to curb scripted pool-draining.
  const rl = await rateLimit({ bucket: "consume", ip: clientIp(req), limit: 20, windowSec: 60 });
  if (!rl.allowed)
    return NextResponse.json(
      { error: "Too many requests. Slow down a moment." },
      { status: 429, headers: { "Retry-After": String(rl.resetSec) } }
    );

  const page = await getPageByUsername(handle);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { url, remaining } = await consumeLink(page.id);
  if (!url) return NextResponse.json({ empty: true });

  // Just handed out the last invite → notify the owner to refill (once).
  if (remaining === 0 && page.email && !Number(page.notified_empty)) {
    await markNotified(page.id);
    const origin = new URL(req.url).origin;
    const manageUrl = `${origin}/manage?u=${encodeURIComponent(page.handle)}&token=${page.edit_token}`;
    await sendRefillEmail({ to: page.email, handle: page.handle, manageUrl });
  }

  return NextResponse.json({ url, remaining });
}
