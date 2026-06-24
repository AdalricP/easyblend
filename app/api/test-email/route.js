import { NextResponse } from "next/server";
import { sendTestEmail } from "@/lib/email";
import { safeEqual } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// One-off deliverability check. Disabled unless TEST_EMAIL_TOKEN is set, and
// gated behind that token so it can't be abused to send mail from your domain.
//   GET /api/test-email?token=<TEST_EMAIL_TOKEN>&to=you@email.com
export async function GET(req) {
  const secret = process.env.TEST_EMAIL_TOKEN;
  if (!secret)
    return NextResponse.json(
      { error: "Test endpoint disabled. Set TEST_EMAIL_TOKEN to enable it." },
      { status: 404 }
    );

  const { searchParams } = new URL(req.url);
  if (!safeEqual(searchParams.get("token") || "", secret))
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });

  const to = searchParams.get("to");
  if (!to)
    return NextResponse.json({ error: "Add ?to=you@email.com" }, { status: 400 });

  const result = await sendTestEmail({ to });
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
