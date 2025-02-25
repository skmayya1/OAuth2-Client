import axios from "axios";

export type TokenData = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  id_token: string;
  created_at: number;
  refresh_token: string;
};

type TokenError = {
  error: string;
  error_description?: string;
};

type RefreshTokenConfig = {
  client_id: string;
  refresh_token: string;
  url: string;
  redirect_uri: string;
  scope?: string;
};

export async function refreshToken(config: RefreshTokenConfig) {
  try {
    const params = new URLSearchParams();
    params.append("client_id", config.client_id);
    params.append("refresh_token", config.refresh_token);
    params.append("redirect_uri", config.redirect_uri);
    params.append("grant_type", "refresh_token");

    if (config.scope) {
      params.append("scope", config.scope);
    }

    const response = await axios.post<TokenData | TokenError>(
      config.url,
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "cache-control": "no-cache",
        },
      }
    );

    if ("error" in response.data) {
      return {
        error: response.data.error_description || response.data.error,
      };
    }

    const tokenData = response.data as TokenData;
    return {
      data: {
        ...tokenData,
      },
    };
  } catch (error: any) {
    console.error("Error refreshing token:", error);
    return {
      error:
        error.response?.data?.error_description || "Error refreshing token",
    };
  }
}
