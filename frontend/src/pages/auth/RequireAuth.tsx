import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const isAuth = !!localStorage.getItem("auth_email");
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
}