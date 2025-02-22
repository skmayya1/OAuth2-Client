import { useEffect, useState } from "react";
import { GithubAuthClient } from "../../types/github";

interface Session {
  user: GithubAuthClient | null;
  isPending: boolean;
  isAuthenticated: boolean;
}

async function getClientSession(): Promise<Session> {
  try {
    const response = await fetch("/api/auth/session");

    if (!response.ok) {
      throw new Error("Failed to fetch session");
    }

    const session = await response.json();
    const isAuthenticated = !!session.user;

    return {
      user: session.user as GithubAuthClient | null,
      isPending: false,
      isAuthenticated,
    };
  } catch (error) {
    return { user: null, isPending: false, isAuthenticated: false };
  }
}

export function useClientSession(): Session {
  const [session, setSession] = useState<Session>({
    user: null,
    isPending: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const fetchSession = async () => {
      const result = await getClientSession();
      setSession(result);
    };
    
    fetchSession();
  }, []);

  return session;
}
