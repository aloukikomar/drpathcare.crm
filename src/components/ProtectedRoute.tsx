import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import type { PermissionKey } from "../utils/permissions";
import { hasPermission } from "../utils/hasPermission";

interface Props {
  children: ReactNode;
  permission?: PermissionKey;
}

export default function ProtectedRoute({ children, permission }: Props) {
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  // 🔒 Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  //console.log(user,permission,hasPermission(user, permission))
  // 🔒 Logged in but no permission
  if (permission && !hasPermission(user, permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
