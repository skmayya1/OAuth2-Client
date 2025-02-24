import axios from "axios";

type TokenData = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  created_at: number;
};

type TokenError = {
  error: string;
  error_description?: string;
};

type exchangeForTokenTypes = {
  client_id: string;
  code: string;
  url: string;
  redirect_uri: string;
};

export async function exchangeForToken(config: exchangeForTokenTypes) {
  try {
    const code_verifier = window.sessionStorage.getItem("code_verifier");
    if (!code_verifier) {
      return { error: "Code verifier not found" };
    }

    const params = new URLSearchParams();
    params.append("client_id", config.client_id);
    params.append("code", config.code);
    params.append("redirect_uri", config.redirect_uri);
    params.append("grant_type", "authorization_code");
    params.append("code_verifier", code_verifier);

    window.sessionStorage.removeItem("code_verifier");

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

    return { data: response.data as TokenData };
  } catch (error: any) {
    console.error("Error exchanging token:", error);
    return {
      error: error.response?.data?.error_description || "Something went wrong",
    };
  }
}


