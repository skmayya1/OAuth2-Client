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

    await this.secureStore("OAuth_", token.data);

    const data = await AddSession({
      tokenData: token.data,
      url: this.oktaDomain + URLSENDPOINT.Info,
    });

    if (!data) {
      return {
        error: "something went wrong",
      };
    }
    await this.secureStore("user", data);

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
    try {
      const session = await this.secureRetrieve("OAuth_");
      const user = await this.secureRetrieve("user"); 

      if (!session || !user) {
        return {
          session: null,
          user: null,
          error: "No active session or user found",
        };
      }

      return {
        session: session as OAUTH,
        user: user as USER,
        error: null,
      };
    } catch (error) {
      console.error("Error in Getuser:", error);
      return {
        session: null,
        user: null,
        error: "Failed to retrieve session data",
      };
    }
  }
  public async RefreshToken() {
    const session = await this.secureRetrieve("OAuth_");

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

    await this.secureStore("OAuth_", token.data);

    const data = await AddSession({
      tokenData: token.data,
      url: this.oktaDomain + URLSENDPOINT.Info,
    });
  }

  private async encrypt(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.client_id);

    const baseKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const salt = encoder.encode(this.oktaDomain);

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encoder.encode(data)
    );
    const encryptedBuffer = new Uint8Array(
      iv.length + encryptedContent.byteLength
    );
    encryptedBuffer.set(iv, 0);
    encryptedBuffer.set(new Uint8Array(encryptedContent), iv.length);
    return btoa(String.fromCharCode(...Array.from(encryptedBuffer)));
  }

  private async decrypt(encryptedData: string): Promise<string> {
    const encryptedBuffer = Uint8Array.from(atob(encryptedData), (c) =>
      c.charCodeAt(0)
    );

    const iv = encryptedBuffer.slice(0, 12);
    const ciphertext = encryptedBuffer.slice(12);

    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.client_id);

    const baseKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const salt = encoder.encode(this.oktaDomain);

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    try {
      const decryptedContent = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        key,
        ciphertext
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedContent);
    } catch (error) {
      console.error("Decryption failed:", error);
      throw new Error("Failed to decrypt data: Invalid key or corrupted data");
    }
  }

  public async secureStore(key: string, data: any): Promise<void> {
    const dataString = typeof data === "string" ? data : JSON.stringify(data);
    const encryptedData = await this.encrypt(dataString);
    window.sessionStorage.setItem(key, encryptedData);
  }

  public async secureRetrieve(key: string): Promise<any> {
    const encryptedData = window.sessionStorage.getItem(key);
    if (!encryptedData) {
      return null;
    }
    try {
      const decryptedString = await this.decrypt(encryptedData);
      try {
        return JSON.parse(decryptedString);
      } catch {
        return decryptedString;
      }
    } catch (error) {
      console.error("Error retrieving secure data:", error);
      return null;
    }
  }
}
