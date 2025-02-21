import { useState, useEffect } from 'react';

export async function getClientSession() {
  try {
    const response = await fetch('/api/auth/user');
    
    if (!response.ok) {
      throw new Error('Failed to fetch session');
    }
    const session = await response.json();
    const isAuthenticated = !!session.user;
    return { user: session.user, isPending: false, isAuthenticated };
  } catch (error) {
    return { user: null, isPending: false, isAuthenticated: false };
  }
}

export function useClientSession() {
  const [session, setSession] = useState({
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
