"use client";

import { useState, useCallback } from "react";
import type { AuthState } from "../types/auth-types";
import { MOCK_USERS } from "@/lib/mock-data";
import type { LoginFormData, RegisterFormData } from "../schemas/auth-schema";

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });

  const login = useCallback(async (data: LoginFormData) => {
    await new Promise((r) => setTimeout(r, 500));
    const user = MOCK_USERS.find((u) => u.email === data.email);
    if (!user) {
      return { success: false as const, error: "Invalid credentials" };
    }
    setState({ user, token: "mock-token", isAuthenticated: true });
    return { success: true as const, user };
  }, []);

  const register = useCallback(async (data: RegisterFormData) => {
    await new Promise((r) => setTimeout(r, 500));
    return { success: true as const };
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, token: null, isAuthenticated: false });
  }, []);

  return { ...state, login, register, logout };
}
