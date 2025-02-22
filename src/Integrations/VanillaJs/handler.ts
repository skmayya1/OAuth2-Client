// Types and interfaces
interface OAuth2Config {
  clientId: string;
  redirectUri: string;
  scope?: string[];
  state?: string;
  allowSignup?: boolean;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}


const DEFAULT_SCOPES = ["read:user", "user:email"];

const GITHUB_URLS = {
  authorize: "https://github.com/login/oauth/authorize",
  token: "https://github.com/login/oauth/access_token",
} as const;

export class OAuth2Client {
  private  clientId: string;
  private  redirectUri: string;
  private  storage: Storage;
  private  defaultScopes:  string[];

  constructor(config: OAuth2Config) {
    this.clientId = config.clientId;
    this.redirectUri = config.redirectUri;
    this.storage = window.sessionStorage;
    this.defaultScopes = DEFAULT_SCOPES;
  }

  public async authorize(options: Partial<OAuth2Config> = {}): Promise<void> {
    try {
      const url = this.createAuthorizationUrl({
        clientId: options.clientId || this.clientId,
        redirectUri: options.redirectUri || this.redirectUri,
        scope: options.scope || this.defaultScopes,
        allowSignup: options.allowSignup,
      });

      window.location.href = url;
    } catch (error) {
      throw new Error(`Authorization failed: ${error}`);
    }
  }


  public async handleCallback(callbackUrl: string): Promise<TokenResponse> {
    const url = new URL(callbackUrl);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      throw new Error(`GitHub OAuth error: ${error}`);
    }

    if (!code) {
      throw new Error("No authorization code received");
    }

    this.validateState(state);

    return await this.exchangeCodeForToken(code);
  }


  private createAuthorizationUrl(config: OAuth2Config): string {
    const state = this.generateAndStoreState();

    const url = new URL(GITHUB_URLS.authorize);
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: (config.scope || this.defaultScopes).join(" "),
      state: state,
      allow_signup: String(config.allowSignup ?? true),
    });

    return `${url}?${params.toString()}`;
  }


  private async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      code: code,
    });

    try {
      const response = await fetch(GITHUB_URLS.token, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error("Token exchange failed");
      }

      const data = await response.json();

      if ("error" in data) {
        throw new Error(`Token error: ${data.error_description || data.error}`);
      }

      return data as TokenResponse;
    } catch (error) {
      throw new Error(`Token exchange failed: ${error}`);
    }
  }


  private generateAndStoreState(): string {
    const state = this.generateSecureState();
    this.storage.setItem("oauth_state", state);
    return state;
  }

  private validateState(state: string | null): void {
    const storedState = this.storage.getItem("oauth_state");
    this.storage.removeItem("oauth_state"); // Clear state after use

    if (!state || !storedState || state !== storedState) {
      throw new Error("Invalid state parameter");
    }
  }

  private generateSecureState(length: number = 32): string {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }


}
