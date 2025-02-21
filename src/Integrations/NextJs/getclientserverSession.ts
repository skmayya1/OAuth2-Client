import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { GithubAuthClient } from "types/github";

//server side function to get user session

export async function getUserSession() : Promise<{ user : GithubAuthClient} | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("auth_token")?.value;
  if (!sessionToken) return null;
  try {
    const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET as string);
    return decoded as { user : GithubAuthClient};
  } catch (error) {
    console.error("Invalid session:", error);
    return null;
  }
} 
