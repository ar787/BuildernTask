import { useState, useCallback } from "react";
import { useApolloClient } from "@apollo/client/react";

interface AuthUser {
  id: number;
  email: string;
  name: string;
}

const TOKEN_KEY = "token";
const USER_KEY = "auth_user";

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const client = useApolloClient();
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);

  const login = useCallback((token: string, authUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    client.clearStore();
  }, [client]);

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
