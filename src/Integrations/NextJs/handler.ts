import { NextRequest, NextResponse } from "next/server";
import { handleCallback } from "Oauth2";
import { ValidateState } from "utils/state";

export async function handler(req: NextRequest) {
  const callbackUrl = req.url;
  
  // const Valid =  ValidateState(callbackUrl);
  //  if (!Valid) {
   //    throw new Error("Invalid state");
  //  }
    
    const client = {
      clientId: process.env.CLIENT_ID as string,
      clientSecret: process.env.CLIENT_SECRET as string,
      redirectUri: process.env.REDIRECT_URI as string,
    };

    try {
      const token = await handleCallback({ client, callbackUrl });

      const headers = new Headers({
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      });

      return NextResponse.json(token, { headers });
    } catch (error) {
      console.error("OAuth callback error:", error);

      return NextResponse.json(
        {
          error:
            error instanceof Error ? error : "Unknown error occurred",
          code: req.nextUrl.searchParams.get("code"),
          state: req.nextUrl.searchParams.get("state"),
        },
        { status: 400 }
      );
    }
}