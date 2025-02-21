export type OAuthClient = {
  clientId: string;
  clientSecret: string | null;
  redirectUri: string;
  state?: string[];
  authorizationEndpoint?: string;
};

const DEFAULT_SCOPES = ["read:user", "user:email"];

export  function createGitHubAuthUrl({
  clientId,
  redirectUri,
  authorizationEndpoint,
}: OAuthClient) {
  const state = process.env.JWT_SECRET; 
  if (!state) {
    throw new Error("JWT_SECRET must be defined");
  }
  const AuthUrl =
    authorizationEndpoint || "https://github.com/login/oauth/authorize";

  const url = new URL(AuthUrl);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", DEFAULT_SCOPES.join(" "));
  url.searchParams.set("state", state);

  return url.toString();
}
