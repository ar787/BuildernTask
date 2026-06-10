import { useState, useCallback } from "react";
import { useApolloClient } from "@apollo/client/react";

interface AuthUser {
  id: number;
  email: string;
  name: string;
}

export const TOKEN_KEY = "token";
export const USER_KEY = "auth_user";

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function getStoredUser(): AuthUser | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return null;
    }
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
