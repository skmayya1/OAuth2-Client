import { generateSecureRandomString } from "./generatePKCECodes";

export  function generateAndStoreState(): string {
    const state = generateSecureRandomString(32);
    window.sessionStorage.setItem("oauth_state", state);
    return state;
}
  
export function validateState(state: string): boolean {
    const ExistingState = window.sessionStorage.getItem("oauth_state");
    window.sessionStorage.removeItem("oauth_state");
    return ExistingState === state;
}