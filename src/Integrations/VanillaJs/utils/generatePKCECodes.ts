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
  
  window.sessionStorage.setItem("code_challenge", codeChallenge);

  window.sessionStorage.setItem("code_verifier", codeVerifier);

  return { codeVerifier, codeChallenge };
}

function base64URLEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...Array.from(buffer))) // Convert to Base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, ""); // URL-safe format
}


export function generateSecureRandomString(length: number = 64): string {
  const allowedChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomValue = window.crypto.getRandomValues(new Uint8Array(1))[0];
    result += allowedChars.charAt(randomValue % allowedChars.length);
  }
  return result;
}
