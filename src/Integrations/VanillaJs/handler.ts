import { AddSession } from "./utils/AddSession";
import { exchangeForToken } from "./utils/exchangeForToken";
import { generateAuthUrl } from "./utils/GenerateAuthUrl";
import { generatePKCECodes } from "./utils/generatePKCECodes";
import { generateAndStoreState, validateState } from "./utils/State";

type OAuthConfigTypes = {
  client_id: string;
  redirect_uri: string;
  oktaDomain: string;
};

const URLSENDPOINT = {
  Authorize: "/oauth2/v1/authorize",
  Token: "/oauth2/v1/token",
  Info: "/oauth2/v1/userinfo",
} as const;

const DEFAULT_SCOPES = [
  "okta.users.read.self",
];

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
    })


    return {
      ok: true,
    };
  }
}
