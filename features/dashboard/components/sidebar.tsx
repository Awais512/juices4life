"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { SIDEBAR_LINKS, MOCK_CURRENT_USER } from "@/lib/mock-data";

const linkIcons: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="size-5" />,
  CheckSquare: <CheckSquare className="size-5" />,
  Users: <Users className="size-5" />,
  Shield: <Shield className="size-5" />,
};

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    router.push("/login");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="size-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
          <span className="font-bold text-base text-primary-foreground">TF</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">Juices 4 Life</span>
          <span className="text-[11px] text-muted-foreground">Workspace</span>
        </div>
      </div>

      <Separator className="mx-4 w-auto" />

      <div className="flex items-center gap-3 px-6 py-4">
        <div className="size-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground border border-border">
          {MOCK_CURRENT_USER.avatar}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-foreground truncate">
            {MOCK_CURRENT_USER.name}
          </span>
          <span className="text-[11px] text-muted-foreground capitalize truncate">
            {MOCK_CURRENT_USER.role}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="flex flex-col gap-1 py-2">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onLinkClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {linkIcons[link.icon]}
                <span className="flex-1">{link.label}</span>
                {isActive && (
                  <ChevronRight className="size-4 text-primary" />
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="px-3 pb-4 mt-auto">
        <Separator className="mb-4" />
        <button
          onClick={() => {
            handleLogout();
            onLinkClick?.();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut className="size-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-sidebar-background border-r border-sidebar-border">
          <SidebarContent />
        </div>
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-50 lg:hidden border-border/50 bg-background/80 backdrop-blur-sm shadow-sm"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar-background border-r border-sidebar-border">
          <SidebarContent onLinkClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
