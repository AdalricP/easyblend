import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getPageByUsername, createPage } from "@/lib/db";
import { RESERVED, isValidHandle, normalizeLinks } from "@/lib/util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { handle, displayName, links } = body || {};

  if (!handle || !isValidHandle(handle))
    return NextResponse.json(
      { error: "Username must be 2–30 characters: letters, numbers, . _ or -" },
      { status: 400 }
    );

  if (RESERVED.has(handle.toLowerCase()))
    return NextResponse.json({ error: "That username is reserved." }, { status: 400 });

  const cleanLinks = normalizeLinks(links);
  if (cleanLinks.length === 0)
    return NextResponse.json(
      { error: "Add at least one valid link (http(s):// or spotify:)." },
      { status: 400 }
    );

  if (await getPageByUsername(handle))
    return NextResponse.json({ error: "That username is already taken." }, { status: 409 });

  const editToken = crypto.randomBytes(24).toString("hex");
  await createPage({
    handle,
    displayName: (displayName || "").slice(0, 80),
    editToken,
    links: cleanLinks,
  });

  return NextResponse.json({
    ok: true,
    handle,
    url: `/${handle}`,
    editToken,
    manageUrl: `/manage?u=${encodeURIComponent(handle)}&token=${editToken}`,
  });
}
