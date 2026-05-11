"use client";

import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";
import { Header } from "./header";

export function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <main
      className={cn(
        "transition-all duration-300",
        isCollapsed ? "lg:pl-16" : "lg:pl-64"
      )}
    >
      <Header />
      <div className="p-4 lg:p-6">{children}</div>
    </main>
  );
}
