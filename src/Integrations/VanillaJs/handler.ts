import { OAUTH, USER } from "types/interfaces";
import { AddSession } from "./utils/AddSession";
import { exchangeForToken } from "./utils/exchangeForToken";
import { generateAuthUrl } from "./utils/GenerateAuthUrl";
import { generatePKCECodes } from "./utils/generatePKCECodes";
import { generateAndStoreState, validateState } from "./utils/State";
import { refreshToken } from "./utils/ResponseToken";

type OAuthConfigTypes = {
  client_id: string;
  redirect_uri: string;
  oktaDomain: string;
  post_auth_uri: string;
};

const URLSENDPOINT = {
  Authorize: "/oauth2/v1/authorize",
  Token: "/oauth2/v1/token",
  Info: "/oauth2/v1/userinfo",
} as const;

const DEFAULT_SCOPES = ["okta.users.read.self"];

export class OAuthClient {
  private client_id: string;
  private redirect_uri: string;
  private scopes: string[] = DEFAULT_SCOPES;
  private oktaDomain: string;
  private post_auth_uri: string;

  constructor(AuthConfig: OAuthConfigTypes) {
    this.client_id = AuthConfig.client_id;
    this.redirect_uri = AuthConfig.redirect_uri;
    this.oktaDomain = "https://" + AuthConfig.oktaDomain;
    this.post_auth_uri = AuthConfig.post_auth_uri;
  }

  public async Authorize() {
    if (!this.client_id || !this.redirect_uri) {
      return {
        error: "Client id , redirect url is missing",
      };
    }
    const pkce = await generatePKCECodes();

    const state = generateAndStoreState();

    const url = generateAuthUrl({
      client_id: this.client_id,
      redirect_uri: this.redirect_uri,
      code_challenge: pkce.codeChallenge,
      state: state,
      url: this.oktaDomain + URLSENDPOINT.Authorize,
    });

    window.sessionStorage.removeItem("code_challenge");

    if (!url) {
      return {
        error: "error generating url",
      };
    }

    window.location.href = url;

    return {
      ok: true,
    };
    //returns a promise , if error , {  error}
  }

  public async HandleCallback() {
    const url = new URL(window.location.href);

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
      return {
        error: "code or state is missing",
      };
    }
    if (!validateState(state)) {
      return {
        error: "state is invalid",
      };
    }
    console.log(this);

    const token = await exchangeForToken({
      client_id: this.client_id,
      code: code,
      redirect_uri: this.redirect_uri,
      url: this.oktaDomain + URLSENDPOINT.Token,
    });

    if (token.error || !token.data) {
      return {
        error: token.error,
      };
    }

    const data = await AddSession({
      tokenData: token.data,
      url: this.oktaDomain + URLSENDPOINT.Info,
    });

    if (!data) {
      return {
        error: "something went wrong",
      };
    }

    window.location.href = this.post_auth_uri;
    return {
      ok: true,
    };
  }

  public async Logout() {
    window.sessionStorage.removeItem("OAuth_");
    window.sessionStorage.removeItem("User");
    window.location.href = this.post_auth_uri;
  }

  public async Getuser(): Promise<{
    session: OAUTH | null;
    user: USER | null;
    error?: string | null;
  }> {
    const session = window.sessionStorage.getItem("OAuth_");
    const user = window.sessionStorage.getItem("User");

    if (!session || !user) {
      return {
        session: null,
        user: null,
        error: "No active session or user found",
      };
    }
    return {
      session: JSON.parse(session) as OAUTH,
      user: JSON.parse(user) as USER,
      error: null,
    };
  }

  public async RefreshToken() {
    const session = window.sessionStorage.getItem("OAuth_");

    const token = await refreshToken({
      client_id: this.client_id,
      redirect_uri: this.redirect_uri,
      url: this.oktaDomain + URLSENDPOINT.Token,
      refresh_token: JSON.parse(session || "{}").refresh_token as string,
      scope: "offline_access openid profile",
    });
    if (!token.data) {
      return {
        error: "Token data is undefined",
      };
    }

    const data = await AddSession({
      tokenData: token.data,
      url: this.oktaDomain + URLSENDPOINT.Info,
    });

  }
}
