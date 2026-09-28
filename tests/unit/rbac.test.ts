import { describe, it, expect } from "vitest";
import { hasRole, isAdmin, isStaff, ROLES } from "@/lib/auth/rbac";
import type { Session } from "next-auth";

describe("Role-Based Access Control (RBAC)", () => {
  const createMockSession = (roles?: string[]): Session =>
    ({
      user: {
        id: "usr_123",
        name: "Test User",
        email: "test@agnipankh.com",
        ...(roles ? { roles } : {}),
      },
      expires: "2099-01-01T00:00:00Z",
    }) as unknown as Session;

  it("returns false for null or undefined sessions", () => {
    expect(hasRole(null, ROLES.ADMIN)).toBe(false);
    expect(hasRole(undefined, ROLES.ADMIN)).toBe(false);
    expect(isAdmin(null)).toBe(false);
    expect(isStaff(undefined)).toBe(false);
  });

  it("returns false for session without roles", () => {
    const session = createMockSession();
    expect(hasRole(session, ROLES.ADMIN)).toBe(false);
    expect(isAdmin(session)).toBe(false);
  });

  it("correctly identifies admin and super admin roles", () => {
    const adminSession = createMockSession([ROLES.ADMIN]);
    const superAdminSession = createMockSession([ROLES.SUPER_ADMIN]);
    const studentSession = createMockSession([ROLES.STUDENT]);

    expect(isAdmin(adminSession)).toBe(true);
    expect(isAdmin(superAdminSession)).toBe(true);
    expect(isAdmin(studentSession)).toBe(false);
  });

  it("correctly identifies staff roles", () => {
    expect(isStaff(createMockSession([ROLES.TRAINER]))).toBe(true);
    expect(isStaff(createMockSession([ROLES.MENTOR]))).toBe(true);
    expect(isStaff(createMockSession([ROLES.FINANCE]))).toBe(true);
    expect(isStaff(createMockSession([ROLES.ADMIN]))).toBe(true);
    expect(isStaff(createMockSession([ROLES.STUDENT]))).toBe(false);
  });

  it("supports matching against array of allowed roles", () => {
    const mentorSession = createMockSession([ROLES.MENTOR]);
    expect(hasRole(mentorSession, [ROLES.ADMIN, ROLES.MENTOR])).toBe(true);
    expect(hasRole(mentorSession, [ROLES.ADMIN, ROLES.FINANCE])).toBe(false);
  });
});
