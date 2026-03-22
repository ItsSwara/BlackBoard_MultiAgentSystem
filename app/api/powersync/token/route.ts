import { NextResponse } from "next/server";
<<<<<<< HEAD

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
=======
import { SignJWT } from "jose";

export async function GET() {
  const privateKeyBase64 = process.env.POWERSYNC_PRIVATE_KEY;
  const powersyncUrl = process.env.NEXT_PUBLIC_POWERSYNC_URL;

  if (!privateKeyBase64 || !powersyncUrl) {
    return NextResponse.json(
      { error: "PowerSync not configured" },
      { status: 503 }
    );
  }

  try {
    const privateKeyPem = Buffer.from(privateKeyBase64, "base64").toString("utf-8");
    const { createPrivateKey } = await import("crypto");
    const privateKey = createPrivateKey(privateKeyPem);

    const token = await new SignJWT({
      sub: "user", // In a real app, use the authenticated user ID
    })
      .setProtectedHeader({ alg: "RS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .setAudience(powersyncUrl)
      .sign(privateKey);

    return NextResponse.json({ token, powersync_url: powersyncUrl });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
  }
}
