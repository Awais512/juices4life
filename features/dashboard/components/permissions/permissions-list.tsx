"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLE_PERMISSIONS, MOCK_USERS } from "@/lib/mock-data";
import type { UserRole, PermissionAction } from "@/types";
import { Shield, Check, X, Users, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const permissionsList: { action: PermissionAction; label: string; description: string }[] = [
  { action: "create", label: "Create", description: "Create new tasks and projects" },
  { action: "read", label: "Read", description: "View tasks, projects, and reports" },
  { action: "update", label: "Update", description: "Modify existing tasks and user data" },
  { action: "delete", label: "Delete", description: "Remove tasks, users, and projects" },
];

export function PermissionsList() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Permissions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Role-based access control overview
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {(Object.entries(ROLE_PERMISSIONS) as [UserRole, PermissionAction[]][]).map(
          ([role, permissions]) => {
            const roleUsers = MOCK_USERS.filter((u) => u.role === role);
            return (
              <Card
                key={role}
                className={cn(
                  "border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden",
                  role === "admin" && "ring-1 ring-primary/10"
                )}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "size-10 rounded-xl flex items-center justify-center",
                        role === "admin" ? "bg-primary/10" : "bg-muted"
                      )}>
                        <Shield className={cn(
                          "size-5",
                          role === "admin" ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold capitalize">
                          {role}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {roleUsers.length} user{roleUsers.length !== 1 ? "s" : ""}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={role === "admin" ? "default" : "secondary"}
                      className={cn(
                        "text-[10px] px-2 py-0.5 font-medium capitalize",
                        role === "admin" && "bg-primary/15 text-primary hover:bg-primary/20"
                      )}
                    >
                      {permissions.length} permissions
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {permissionsList.map((perm) => {
                      const hasPermission = permissions.includes(perm.action);
                      return (
                        <div
                          key={perm.action}
                          className={cn(
                            "flex items-center gap-3 rounded-lg p-3 transition-colors",
                            hasPermission
                              ? "bg-emerald-500/5"
                              : "bg-muted/20 opacity-60"
                          )}
                        >
                          <div className={cn(
                            "size-7 rounded-lg flex items-center justify-center",
                            hasPermission
                              ? "bg-emerald-500/10"
                              : "bg-muted"
                          )}>
                            {hasPermission ? (
                              <Check className="size-3.5 text-emerald-400" />
                            ) : (
                              <X className="size-3.5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {perm.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {perm.description}
                            </p>
                          </div>
                          <Badge
                            variant={hasPermission ? "default" : "secondary"}
                            className={cn(
                              "text-[10px] px-2 py-0.5 font-medium",
                              hasPermission && "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20"
                            )}
                          >
                            {hasPermission ? "Allowed" : "Restricted"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          }
        )}

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-muted flex items-center justify-center">
                <Users className="size-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Role Summary</CardTitle>
                <CardDescription className="text-xs">
                  Distribution of users across roles
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/30 p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{MOCK_USERS.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Users</p>
              </div>
              <div className="rounded-lg bg-primary/5 p-4 text-center ring-1 ring-primary/10">
                <p className="text-2xl font-bold text-primary">
                  {MOCK_USERS.filter((u) => u.role === "admin").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Admins</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {MOCK_USERS.filter((u) => u.role === "employee").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
