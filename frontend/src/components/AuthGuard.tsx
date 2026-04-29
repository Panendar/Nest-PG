import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../state/AuthContext";
import { getHomePathForUser, isBuilderUser } from "../utils/authRouting";

export function AuthGuard() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  const isBuilderArea = location.pathname.startsWith("/owner");
  const isUserArea = location.pathname.startsWith("/app") || location.pathname.startsWith("/user");

  if (isBuilderUser(user) && isUserArea) {
    return <Navigate to={getHomePathForUser(user)} replace />;
  }

  if (!isBuilderUser(user) && isBuilderArea) {
    return <Navigate to={getHomePathForUser(user)} replace />;
  }

  return <Outlet />;
}
