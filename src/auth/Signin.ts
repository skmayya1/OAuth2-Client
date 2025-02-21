"use client";
import { createGitHubAuthUrl } from "../Oauth2";

export const signin = () => {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error("Missing NEXT_PUBLIC environment variables");
    return;
  }

  console.log("Redirecting to GitHub OAuth...");
  window.location.href = createGitHubAuthUrl({
    clientId,
    redirectUri,
    clientSecret: null,
  });
};
