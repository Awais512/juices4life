import { MOCK_USERS } from "@/lib/mock-data";
import type { LoginCredentials } from "../types/auth-types";

export function validateCredentials(
  credentials: LoginCredentials
): boolean {
  const user = MOCK_USERS.find(
    (u) => u.email === credentials.email
  );
  return user !== undefined;
}

export function getUserByEmail(email: string) {
  return MOCK_USERS.find((u) => u.email === email) ?? null;
}

export function formatUserRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
