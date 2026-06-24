import { NextResponse } from "next/server";
import { rateLimit, getPagesByEmail } from "@/lib/db";
import { isValidEmail } from "@/lib/util";
import { clientIp } from "@/lib/auth";
import { sendRecoveryEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Emails the manage link(s) for pages registered to the given address.
// Always responds the same way whether or not the email exists, so it can't be
// used to enumerate which emails have accounts.
export async function POST(req) {
  const rl = await rateLimit({ bucket: "recover", ip: clientIp(req), limit: 5, windowSec: 60 });
  if (!rl.allowed)
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429, headers: { "Retry-After": String(rl.resetSec) } }
    );

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body?.email || "").trim();
  if (!isValidEmail(email))
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });

  const pages = await getPagesByEmail(email);
  if (pages.length) {
    const origin = new URL(req.url).origin;
    await sendRecoveryEmail({
      to: email,
      pages: pages.map((p) => ({
        handle: p.handle,
        manageUrl: `${origin}/manage?u=${encodeURIComponent(p.handle)}&token=${p.edit_token}`,
      })),
    });
  }

  // Generic response regardless of whether anything matched.
  return NextResponse.json({ ok: true });
}
