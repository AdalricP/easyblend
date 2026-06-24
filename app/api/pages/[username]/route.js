import { NextResponse } from "next/server";
import { getPageByUsername, updatePage } from "@/lib/db";
import { normalizeLinks } from "@/lib/util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns the page's links — gated behind the edit token so only the owner
// (who holds the manage link) can read them back for editing.
export async function GET(req, { params }) {
  const page = await getPageByUsername(params.username);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const token = new URL(req.url).searchParams.get("token");
  if (token !== page.edit_token)
    return NextResponse.json({ error: "Invalid edit token" }, { status: 403 });

  return NextResponse.json({
    handle: page.handle,
    displayName: page.display_name,
    links: page.links.map((l) => l.url),
    visits: Number(page.visits),
  });
}

export async function PUT(req, { params }) {
  const page = await getPageByUsername(params.username);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if ((body || {}).token !== page.edit_token)
    return NextResponse.json({ error: "Invalid edit token" }, { status: 403 });

  const cleanLinks = normalizeLinks(body.links);
  if (cleanLinks.length === 0)
    return NextResponse.json({ error: "Add at least one valid link." }, { status: 400 });

  await updatePage(page.id, {
    displayName: (body.displayName || "").slice(0, 80),
    links: cleanLinks,
  });

  return NextResponse.json({ ok: true });
}
