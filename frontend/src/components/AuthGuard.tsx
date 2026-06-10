import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth, TOKEN_KEY, isTokenExpired } from "../hooks/useAuth";

export function AuthGuard() {
  const { isAuthenticated, logout } = useAuth();
  const token = localStorage.getItem(TOKEN_KEY);
  const tokenExpired = isAuthenticated && (!token || isTokenExpired(token));

  useEffect(() => {
    if (tokenExpired) logout();
  }, [tokenExpired, logout]);

  if (!isAuthenticated || tokenExpired) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
