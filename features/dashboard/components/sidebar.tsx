"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Shield,
  LogOut,
  Menu,
  ChevronRight,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import { SIDEBAR_LINKS, MOCK_CURRENT_USER } from "@/lib/mock-data";
import { useSidebar } from "./sidebar-context";

const linkIcons: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="size-5" />,
  CheckSquare: <CheckSquare className="size-5" />,
  Users: <Users className="size-5" />,
  Shield: <Shield className="size-5" />,
};

function SidebarContent({
  onLinkClick,
  isCollapsed,
}: {
  onLinkClick?: () => void;
  isCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    router.push("/login");
  }

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex items-center py-5",
          isCollapsed ? "justify-center px-3" : "gap-3 px-6"
        )}
      >
        <div className="size-9 shrink-0 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
          <span className="font-bold text-base text-primary-foreground">TF</span>
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              Juices 4 Life
            </span>
            <span className="text-[11px] text-muted-foreground">Workspace</span>
          </div>
        )}
      </div>

      <Separator className="mx-4 w-auto" />

      <div
        className={cn(
          "flex items-center py-4",
          isCollapsed ? "justify-center px-3" : "gap-3 px-6"
        )}
      >
        <div className="size-9 shrink-0 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground border border-border">
          {MOCK_CURRENT_USER.avatar}
        </div>
        {!isCollapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-foreground truncate">
              {MOCK_CURRENT_USER.name}
            </span>
            <span className="text-[11px] text-muted-foreground capitalize truncate">
              {MOCK_CURRENT_USER.role}
            </span>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="flex flex-col gap-1 py-2">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const linkEl = (
              <Link
                key={link.href}
                href={link.href}
                onClick={onLinkClick}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isCollapsed ? "justify-center" : "gap-3",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {linkIcons[link.icon]}
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{link.label}</span>
                    {isActive && <ChevronRight className="size-4 text-primary" />}
                  </>
                )}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={link.href}>
                  <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                  <TooltipContent side="right">{link.label}</TooltipContent>
                </Tooltip>
              );
            }

            return linkEl;
          })}
        </nav>
      </ScrollArea>

      <div className={cn("pb-4 mt-auto", isCollapsed ? "px-3" : "px-3")}>
        <Separator className="mb-4" />
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  handleLogout();
                  onLinkClick?.();
                }}
                className="flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
              >
                <LogOut className="size-5 shrink-0" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={() => {
              handleLogout();
              onLinkClick?.();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut className="size-5 shrink-0" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const { isCollapsed, toggle } = useSidebar();

  return (
    <>
      <aside
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300",
          isCollapsed ? "lg:w-16" : "lg:w-64"
        )}
      >
        <div className="relative flex flex-col flex-1 bg-sidebar-background border-r border-sidebar-border">
          <SidebarContent isCollapsed={isCollapsed} />
          <button
            onClick={toggle}
            className="absolute -right-3 top-5 flex items-center justify-center size-6 rounded-full border border-sidebar-border bg-sidebar-background text-muted-foreground hover:text-foreground transition-colors shadow-sm"
          >
            {isCollapsed ? (
              <PanelLeft className="size-3.5" />
            ) : (
              <PanelLeftClose className="size-3.5" />
            )}
          </button>
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
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContent isCollapsed={false} onLinkClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
