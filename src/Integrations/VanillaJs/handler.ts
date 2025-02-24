import { exchangeForToken } from "./utils/exchangeForToken";
import { generateAuthUrl } from "./utils/GenerateAuthUrl";
import { generatePKCECodes } from "./utils/generatePKCECodes";
import { generateAndStoreState, validateState } from "./utils/State";

type OAuthConfigTypes = {
  client_id: string;
  redirect_uri: string;
  oktaDomain:string
};

const URLSENDPOINT = {
  Authorize: "/oauth/authorize",
  Token: "/oauth/token",
} as const;

const DEFAULT_SCOPES = ["profile", "email"];

export class OAuthClient {
  private client_id: string;
  private redirect_uri: string;
  private scopes: string[] = DEFAULT_SCOPES;
  private oktaDomain: string;

  constructor(AuthConfig: OAuthConfigTypes) {
    this.client_id = AuthConfig.client_id;
    this.redirect_uri = AuthConfig.redirect_uri;
    this.oktaDomain = "https://"+AuthConfig.oktaDomain;
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
      url: this.oktaDomain +URLSENDPOINT.Authorize,
    });

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
      url:this.oktaDomain + URLSENDPOINT.Token,
    });

    if (token.error) {
      return {
        error: token.error,
      };
    }
    console.log(token.data);
    return {
      ok: true,
    };
  }
}

