"use client";

import { createContext, useContext } from "react";
import type { User } from "@/types";

type UserContextValue = {
  user: User | null;
};

const UserContext = createContext<UserContextValue>({ user: null });

export function UserProvider({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return ctx.user;
}
