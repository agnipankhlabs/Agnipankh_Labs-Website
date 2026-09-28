import type { Session } from "next-auth";

export const ROLES = {
  STUDENT: "student",
  MENTOR: "mentor",
  TRAINER: "trainer",
  FINANCE: "finance",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

export type RoleKey = (typeof ROLES)[keyof typeof ROLES] | string;

export const STAFF_ROLES: string[] = [
  ROLES.MENTOR,
  ROLES.TRAINER,
  ROLES.FINANCE,
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
];

export const ADMIN_ROLES: string[] = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

/**
 * Check if the session user has at least one of the specified roles.
 */
export function hasRole(session: Session | null | undefined, allowedRoles: RoleKey | RoleKey[]): boolean {
  if (!session?.user) return false;

  const userRoles: string[] =
    (session.user as unknown as { roles?: string[] }).roles ?? [];

  const checkRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return checkRoles.some((role) => userRoles.includes(role));
}

/**
 * Check if user is an admin or super admin.
 */
export function isAdmin(session: Session | null | undefined): boolean {
  return hasRole(session, ADMIN_ROLES);
}

/**
 * Check if user is any staff member (mentor, trainer, finance, admin).
 */
export function isStaff(session: Session | null | undefined): boolean {
  return hasRole(session, STAFF_ROLES);
}
