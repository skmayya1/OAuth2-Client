interface PKCECODES {
  codeVerifier: string;
  codeChallenge: string;
}

export async function generatePKCECodes(): Promise<PKCECODES> {
  const codeVerifier = generateSecureRandomString(64);

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);

  const codeChallenge = base64URLEncode(new Uint8Array(digest));

  window.sessionStorage.setItem("code_verifier", codeVerifier);

  return { codeVerifier, codeChallenge };
}

function base64URLEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode.apply(null, Array.from(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generateSecureRandomString(length: number = 32): string {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);

  return Array.from(array)
    .map((byte) => {
      const allowedChars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
      return allowedChars.charAt(byte % allowedChars.length);
    })
    .join("");
}
