import { ValidateState } from "../utils/state";
import { OAuthClient } from "./create-authorization-url";
import axios from "axios";

type CallbackTypes = {
  client: OAuthClient;
  callbackUrl: string;
};

interface TokenResponse {
  access_token: string;
  scope: string;
  token_type: string;
}

export async function handleCallback({
  client,
  callbackUrl,
}: CallbackTypes): Promise<TokenResponse> {
    const TokenEndpoint = "https://github.com/login/oauth/access_token";
    
  // Validate the state
  const isvalid = await ValidateState(callbackUrl);

  if (!isvalid) {
    throw new Error("Invalid state");
  }

  // Token Exhange
  const url = new URL(callbackUrl);

  const code = url.searchParams.get("code");

  if (!code) {
    throw new Error("Code not found in callback URL");
  }

  const body = new URLSearchParams();
  const headers: Record<string, any> = {
    "content-type": "application/x-www-form-urlencoded",
    accept: "application/json",
    "user-agent": "oauth2-github",
  };

  body.append("client_id", client.clientId);
  body.append("client_secret", client.clientSecret);
  body.append("code", code);
  body.append("redirect_uri", client.redirectUri);

  const response = await axios.post(TokenEndpoint, {
    headers,
    body,
  });
    
  return response.data as TokenResponse;
}
