// auth0-client-sk/Integrations/handler.ts
import { NextRequest, NextResponse } from "next/server";
import { createGitHubAuthUrl, handleCallback } from "../../Oauth2";
import jwt from "jsonwebtoken";

import {
  generateJWTsession,
  generateState,
  ValidateState,
} from "../../utils/state";
import { FetchUserData } from "./utils/fetchUserData";
import { GithubAuthClient } from "types/github";

export async function handler(req: NextRequest) {
  const callbackUrl = req.url;
  const pathname = new URL(callbackUrl).pathname;

  if (pathname.includes("/api/auth/signin")) {
    const clientId = process.env.CLIENT_ID;
    const redirectUri = process.env.REDIRECT_URI;

    if (!clientId || !redirectUri) {
      console.error("Missing  environment variables");
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

      const Data: GithubAuthClient = (
        await FetchUserData({ access_token: token.access_token })
      ).user;

      const Encoded = generateJWTsession({ user: Data });


      const response = NextResponse.redirect(
        process.env.POST_AUTH_URL as string
      );

      response.cookies.set({
        name: "auth_token",
        value: Encoded,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 5 * 24 * 60 * 60,
      });

      return response;
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

  if (pathname.includes("/api/auth/signout")) {
    // Create a response to redirect after signout
    const response = NextResponse.redirect(
      process.env.POST_LOGOUT_URL as string
    );
    // Delete the 'auth_token' cookie
    response.cookies.delete("auth_token");

    return response;
  }

  if (pathname.includes("/api/auth/session")) {
    const token = req.cookies.get("auth_token")?.value;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        return NextResponse.json({ user: decoded });
      } catch (error) {
        console.error("Invalid token:", error);
        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
