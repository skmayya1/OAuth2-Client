import { createGitHubAuthUrl } from "../Oauth2";

export const signin = async () => {
  const redirectUri = process.env.NEXT_PUBLIC_URL + "/api/auth/signin";
  window.location.href = redirectUri;
};
