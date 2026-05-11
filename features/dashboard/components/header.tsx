"use client";

import { useRouter } from "next/navigation";
import { Search, LogOut, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MOCK_CURRENT_USER } from "@/lib/mock-data";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-sm px-4 lg:px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks, employees..."
            className="pl-9 h-9 bg-muted/50 border-none focus-visible:bg-background"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors">
              <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground border border-border">
                {MOCK_CURRENT_USER.avatar}
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-foreground leading-tight">
                  {MOCK_CURRENT_USER.name}
                </span>
                <span className="text-[11px] text-muted-foreground capitalize leading-tight">
                  {MOCK_CURRENT_USER.role}
                </span>
              </div>
              <ChevronDown className="hidden md:block size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{MOCK_CURRENT_USER.name}</span>
                <span className="text-xs text-muted-foreground">{MOCK_CURRENT_USER.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/login")}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
