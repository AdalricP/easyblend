import { NextResponse } from "next/server";
import { countPages, maxSpots } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const max = maxSpots();
  const used = await countPages();
  return NextResponse.json({
    used,
    max,
    remaining: Math.max(0, max - used),
    full: used >= max,
  });
}
