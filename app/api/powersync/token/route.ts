import { NextResponse } from "next/server";

export async function GET() {
  const powersyncUrl = process.env.NEXT_PUBLIC_POWERSYNC_URL;

  if (!powersyncUrl) {
    return NextResponse.json({ error: "NEXT_PUBLIC_POWERSYNC_URL not configured" }, { status: 503 });
  }

  try {
    // Use PowerSync development token endpoint (no RSA keypair needed)
    const res = await fetch(
      `${powersyncUrl}/dev/token?user_id=blackboard-user`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("[PowerSync dev token] Error:", text);
      return NextResponse.json({ error: "Failed to get dev token" }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ token: data.token, powersync_url: powersyncUrl });
  } catch (e) {
    console.error("[PowerSync dev token]", e);
    return NextResponse.json({ error: "Token fetch failed" }, { status: 500 });
  }
}
