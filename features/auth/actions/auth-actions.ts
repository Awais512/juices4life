"use server";

import { MOCK_USERS } from "@/lib/mock-data";
import type { LoginCredentials, RegisterData } from "../types/auth-types";

export async function loginAction(credentials: LoginCredentials) {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const user = MOCK_USERS.find((u) => u.email === credentials.email);

  if (!user) {
    return { success: false as const, error: "Invalid email or password" };
  }

  return {
    success: true as const,
    data: { user, token: "mock-jwt-token" },
  };
}

export async function registerAction(data: RegisterData) {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const exists = MOCK_USERS.some((u) => u.email === data.email);
  if (exists) {
    return { success: false as const, error: "Email already registered" };
  }

  return {
    success: true as const,
    data: { message: "Registration successful" },
  };
}

export async function logoutAction() {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return { success: true as const };
}
