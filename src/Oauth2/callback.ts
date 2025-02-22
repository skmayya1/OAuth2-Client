import { ValidateState } from "../utils/state";
import { OAuthClient } from "./create-authorization-url";
import axios from "axios";

import { } from "../Integrations/NextJs"

type CallbackTypes = {
  client: OAuthClient;
  callbackUrl: string;
};

interface TokenResponse {
  access_token: string;
  scope: string;
  token_type: string;
  refresh_token: string;
}

export async function handleCallback({
  client,
  callbackUrl,
}: CallbackTypes): Promise<TokenResponse> {

  const TokenEndpoint = "https://github.com/login/oauth/access_token";

  const url = new URL(callbackUrl);
  const code = url.searchParams.get("code");

  if (!code) {
    throw new Error("Code not found in callback URL");
  }

  const body = new URLSearchParams();
  body.append("client_id", client.clientId);
  body.append("client_secret", client.clientSecret as string);
  body.append("code", code);
  body.append("redirect_uri", client.redirectUri);

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
    "User-Agent": "oauth2-github",
  };

  const response = await axios.post(TokenEndpoint, body.toString(), {
    headers,
  });
  return response.data as TokenResponse;
}
