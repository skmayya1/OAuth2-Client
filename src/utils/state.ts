import jwt from "jsonwebtoken";
import { GithubAuthClient } from "types/github";

export function ValidateState(CallbackURL: string) {
  const url = new URL(CallbackURL);
  const receivedState = url.searchParams.get("state");
  if (!receivedState) {
    throw new Error("State not found in callback URL");
  }
  const decoded = jwt.verify(receivedState, process.env.JWT_SECRET as string);
  if (!decoded) {
    return false;
  }
  return true;
}

export function generateState(): string {
  return jwt.sign({ valid: true }, process.env.JWT_SECRET as string, {
    algorithm: "HS256",
    expiresIn: "10m",
  });
}

export function generateJWTsession({
  user,
}: {
  user: GithubAuthClient;
}): string {
  return jwt.sign(user, process.env.JWT_SECRET as string, {
    algorithm: "HS256",
    expiresIn: "5d",
  });
}

