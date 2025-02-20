import { GenerateState } from "../utils/state";

export type OAuthClient = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  state?: string[];
  authorizationEndpoint?: string;
};

const DEFAULT_SCOPES = ["read:user", "user:email"];

export function createGitHubAuthUrl({
  clientId,
  redirectUri,
  authorizationEndpoint,
}: OAuthClient) {
  const state = GenerateState(); // Generate a CSRF state token
  const AuthUrl =
    authorizationEndpoint || "https://github.com/login/oauth/authorize";

  const url = new URL(AuthUrl);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", DEFAULT_SCOPES.join(" "));
  url.searchParams.set("state", state);

  return url.toString();
}
