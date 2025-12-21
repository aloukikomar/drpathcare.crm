
export interface Role {
  id: number;
  name?: string;
  view_all?: boolean;
}

export interface User {
  id: number;
  role: Role | number | null; // 👈 null allowed
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Resolve role id safely */
export function getRoleId(user: User | null): number | null {
  if (!user || user.role == null) return null;

  return typeof user.role === "object"
    ? user.role.id
    : user.role;
}

/** Admin / view-all check */
export function canViewAll(user: User | null): boolean {
  if (!user || user.role == null) return false;

  return (
    typeof user.role === "object" &&
    user.role.view_all === true
  );
}

/** Role-based access */
export function hasRole(
  user: User | null,
  allowedRoles: number[]
): boolean {
  if (!user) return false;

  // Admin override
  if (canViewAll(user)) return true;

  const roleId = getRoleId(user);
  if (roleId == null) return false;

  return allowedRoles.includes(roleId);
}

/** Auth check */
export function isAuthenticated(): boolean {
  return !!getCurrentUser();
}
