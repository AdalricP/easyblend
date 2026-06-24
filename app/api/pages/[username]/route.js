import { NextResponse } from "next/server";
import { getPageByUsername, updatePage, rateLimit } from "@/lib/db";
import { isValidEmail, parseLinks } from "@/lib/util";
import { safeEqual, clientIp } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns the page's links — gated behind the edit token so only the owner
// (who holds the manage link) can read them back for editing.
export async function GET(req, { params }) {
  const page = await getPageByUsername(params.username);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const token = new URL(req.url).searchParams.get("token");
  if (!safeEqual(token || "", page.edit_token))
    return NextResponse.json({ error: "Invalid edit token" }, { status: 403 });

  return NextResponse.json({
    handle: page.handle,
    email: page.email,
    links: page.links.map((l) => l.url),
    remaining: page.links.length,
    visits: Number(page.visits),
  });
}

export async function PUT(req, { params }) {
  const rl = await rateLimit({ bucket: "manage", ip: clientIp(req), limit: 30, windowSec: 60 });
  if (!rl.allowed)
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(rl.resetSec) } }
    );

  const page = await getPageByUsername(params.username);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!safeEqual((body || {}).token || "", page.edit_token))
    return NextResponse.json({ error: "Invalid edit token" }, { status: 403 });

  if (!isValidEmail(body.email))
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });

  const { valid, invalid } = parseLinks(body.links);
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
      { error: "Add at least one Spotify Blend invite link." },
      { status: 400 }
    );

  await updatePage(page.id, {
    email: body.email.trim(),
    links: valid,
  });

  return NextResponse.json({ ok: true, remaining: valid.length });
}
