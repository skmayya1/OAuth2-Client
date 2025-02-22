"use client";
import { useState, useEffect } from "react";
import { GithubAuthClient } from "types";

interface Session {
  user: GithubAuthClient | null;
  isPending: boolean;
  isAuthenticated: boolean;
}

async function getClientSession() {
  try {
    const response = await fetch("/api/auth/session");

    if (!response.ok) {
      throw new Error("Failed to fetch session");
    }
    const session = await response.json();
    const isAuthenticated = !!session.user;
    return { user: session.user, isPending: false, isAuthenticated };
  } catch (error) {
    return { user: null, isPending: false, isAuthenticated: false };
  }
}

export function useClientSession() {
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
