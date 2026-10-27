import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "beast_system_default_secret";
const BACKEND_SERVICE_URL = process.env.SERVICE_URL || "https://beastsystem-70875693050.us-central1.run.app";

/**
 * Validates HMAC SHA-256 signature from GitHub webhook headers.
 */
function verifyGitHubSignature(payloadText: string, signatureHeader: string | null): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
    return false;
  }

  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(payloadText).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(digest));
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");
    const eventType = request.headers.get("x-github-event") || "ping";

    // 1. Verify Request Signature
    if (!verifyGitHubSignature(rawBody, signature)) {
      console.warn("⚠️ [BEAST Webhook] Unauthorized signature validation failed.");
      return NextResponse.json(
        { error: "Invalid signature verification" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);

    // 2. Handle Ping Events
    if (eventType === "ping") {
      console.log(`✅ [BEAST Webhook] GitHub ping received: ${payload.zen}`);
      return NextResponse.json(
        { status: "connected", message: "Next.js App Router Hook initialized." },
        { status: 200 }
      );
    }

    const repoName = payload.repository?.full_name || "unknown";
    const sender = payload.sender?.login || "unknown";

    console.log(`⚡ [BEAST System Bus] Next.js Route Received '${eventType}' from ${repoName} (by ${sender})`);

    // 3. Dispatch to Cloud Run Backend Service
    const backendResponse = await fetch(`${BACKEND_SERVICE_URL}/api/v1/webhooks/github`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Hub-Signature-256": signature || "",
        "X-GitHub-Event": eventType,
        "X-BEAST-Forwarded-By": "NextJS-AppRouter",
      },
      body: rawBody,
    });

    const backendResult = await backendResponse.json();

    return NextResponse.json(
      {
        status: "success",
        event: eventType,
        repository: repoName,
        cloud_run_response: backendResult,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ [BEAST Webhook Error]:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
