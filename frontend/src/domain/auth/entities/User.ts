export type Permission = string;

export type RoleName = string;

export interface User {
  id: number;
  name: string;
  email: string;
  roles: RoleName[];
  permissions: Permission[];
}

export const SUPER_ADMIN_ROLE: RoleName = 'admin';

export function hasRole(user: User, role: RoleName): boolean {
  return user.roles.includes(role);
}

export function hasPermission(user: User, permission: Permission): boolean {
  return hasRole(user, SUPER_ADMIN_ROLE) || user.permissions.includes(permission);
}

export function hasAllPermissions(user: User, permissions: readonly Permission[]): boolean {
  return permissions.every((permission) => hasPermission(user, permission));
}

export function hasAnyPermission(user: User, permissions: readonly Permission[]): boolean {
  return permissions.some((permission) => hasPermission(user, permission));
}