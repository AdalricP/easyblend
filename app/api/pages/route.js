import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getPageByUsername, createPage, rateLimit, countPages, maxSpots } from "@/lib/db";
import { RESERVED, isValidHandle, isValidEmail, parseLinks, MAX_LINKS } from "@/lib/util";
import { clientIp } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  // Throttle page creation per IP to curb spam / squatting.
  const rl = await rateLimit({ bucket: "create", ip: clientIp(req), limit: 10, windowSec: 60 });
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

  const { handle, email, links } = body || {};

  if (!handle || !isValidHandle(handle))
    return NextResponse.json(
      { error: "Username must be 2–30 characters: letters, numbers, . _ or -" },
      { status: 400 }
    );

  if (RESERVED.has(handle.toLowerCase()))
    return NextResponse.json({ error: "That username is reserved." }, { status: 400 });

  if (!isValidEmail(email))
    return NextResponse.json(
      { error: "Enter a valid email so we can tell you when to refill." },
      { status: 400 }
    );

  const { valid, invalid } = parseLinks(links);
  if (invalid.length)
    return NextResponse.json(
      {
        error: `${invalid.length} ${invalid.length === 1 ? "link isn't a" : "links aren't"} Spotify link${invalid.length === 1 ? "" : "s"}. Only spotify.link / open.spotify.com URLs are allowed.`,
        invalid: invalid.slice(0, 10),
      },
      { status: 400 }
    );
  if (valid.length === 0)
    return NextResponse.json(
      { error: "Add at least one Spotify Blend invite link (spotify.link/…)." },
      { status: 400 }
    );
  if (valid.length > MAX_LINKS)
    return NextResponse.json(
      { error: `You can add at most ${MAX_LINKS} blend links.` },
      { status: 400 }
    );

  if (await getPageByUsername(handle))
    return NextResponse.json({ error: "That username is already taken." }, { status: 409 });

  // Global cap: only N spots exist.
  const max = maxSpots();
  if ((await countPages()) >= max)
    return NextResponse.json(
      { error: `easyblend is full — all ${max} spots are taken.`, full: true },
      { status: 403 }
    );

  const editToken = crypto.randomBytes(24).toString("hex");
  try {
    await createPage({
      handle,
      email: email.trim(),
      editToken,
      links: valid,
    });
  } catch (e) {
    // Two concurrent creates of the same handle race past the check above; the
    // UNIQUE constraint catches the loser. Surface it as "taken", not a 500.
    if (String(e?.message || "").toLowerCase().includes("unique"))
      return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
    console.error("[create] failed:", e?.message || e);
    return NextResponse.json({ error: "Could not create page. Try again." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    handle,
    url: `/${handle}`,
    editToken,
    manageUrl: `/manage?u=${encodeURIComponent(handle)}&token=${editToken}`,
  });
}
