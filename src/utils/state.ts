import crypto from "crypto";

export  function GenerateState() {
    const state = crypto.randomBytes(16).toString("hex"); // Random 32-character string
    sessionStorage.setItem("state", state);
    return state;
}

export async function ValidateState(CallbackURL: string) { 
    const url = new URL(CallbackURL);
    const state = url.searchParams.get("state");
    const sessionState = sessionStorage.getItem("state");
    sessionState && sessionStorage.removeItem("state");
    if (sessionState !== state) {
        throw new Error("Invalid state");
    }
    return true;
}