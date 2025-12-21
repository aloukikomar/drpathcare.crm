// src/utils/hasPermission.ts

import type { PermissionKey } from "./permissions";

export function hasPermission(
  user: any,
  permission: PermissionKey
): boolean {
  if (!user) return false;

  // 1️⃣ Full access roles
  if (user.role?.view_all === true) return true;

  // 2️⃣ User-level custom permissions
  if (Array.isArray(user.custom_permissions)) {
    if (user.custom_permissions.includes(permission)) return true;
  }

  // 3️⃣ Role permissions
  if (Array.isArray(user.role?.permissions)) {
    return user.role.permissions.includes(permission);
  }

  return false;
}
