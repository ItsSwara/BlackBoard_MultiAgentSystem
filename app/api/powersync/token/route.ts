import { NextResponse } from "next/server";
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
  }
}
