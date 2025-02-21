// auth0-client-sk/Integrations/handler.ts
import { NextRequest, NextResponse } from "next/server";
import { createGitHubAuthUrl, handleCallback } from "../../Oauth2";
import { ValidateState } from "../../utils/state";

export async function handler(req: NextRequest) {
  const callbackUrl = req.url;
  const pathname = new URL(callbackUrl).pathname;

  if (pathname.includes("/api/auth/signin")) {
    const clientId = process.env.CLIENT_ID;
    const redirectUri = process.env.REDIRECT_URI;

    if (!clientId || !redirectUri) {
      console.error("Missing NEXT_PUBLIC environment variables");
      return NextResponse.json(
        { error: "Missing configuration" },
        { status: 500 }
      );
    } 

    const URL = createGitHubAuthUrl({
      clientId,
      redirectUri,
      clientSecret: null,
    });
    return NextResponse.redirect(URL);
  }

  if (pathname.includes("/api/auth/callback/github")) {
    const client = {
      clientId: process.env.CLIENT_ID as string,
      clientSecret: process.env.CLIENT_SECRET as string,
      redirectUri: process.env.REDIRECT_URI as string,
    };

    const valid = ValidateState(callbackUrl);
    console.log("Valid state:", valid);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid state in callback URL" },
        { status: 400 }
      );
    }

    try {
      const token = await handleCallback({ client, callbackUrl });
      return NextResponse.json(token, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("OAuth callback error:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
          code: req.nextUrl.searchParams.get("code"),
          state: req.nextUrl.searchParams.get("state"),
        },
        { status: 400 }
      );
    }
  }

  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
