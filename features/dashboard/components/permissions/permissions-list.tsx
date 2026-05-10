"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MOCK_USERS } from "@/lib/mock-data";
import type { PermissionAction } from "@/types";
import { Save, RotateCcw, Lock, Unlock, Shield, Users, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_ACTIONS: PermissionAction[] = ["create", "read", "update", "delete"];

const actionMeta: Record<PermissionAction, { label: string; description: string }> = {
  create: { label: "Create", description: "Create new tasks and projects" },
  read: { label: "Read", description: "View tasks, projects, and reports" },
  update: { label: "Update", description: "Modify existing tasks and user data" },
  delete: { label: "Delete", description: "Remove tasks, users, and projects" },
};

function deepCopyUsers(users: typeof MOCK_USERS) {
  return users.map((u) => ({ ...u, permissions: [...u.permissions] }));
}

function userHasChanges(
  user: typeof MOCK_USERS[number],
  original: typeof MOCK_USERS[number]
): boolean {
  const a = [...user.permissions].sort();
  const b = [...original.permissions].sort();
  return a.length !== b.length || a.some((v, i) => v !== b[i]);
}

export function PermissionsList() {
  const [users, setUsers] = useState(() => deepCopyUsers(MOCK_USERS));
  const [originalUsers] = useState(() => deepCopyUsers(MOCK_USERS));
  const [savedToast, setSavedToast] = useState(false);

  const dirtyUsers = users.filter((u, i) => userHasChanges(u, originalUsers[i]));
  const isDirty = dirtyUsers.length > 0;

  const togglePermission = useCallback((userId: string, action: PermissionAction) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId || u.role === "admin") return u;
        const perms = [...u.permissions];
        const idx = perms.indexOf(action);
        if (idx >= 0) {
          perms.splice(idx, 1);
        } else {
          perms.push(action);
        }
        return { ...u, permissions: perms };
      })
    );
  }, []);

  function handleSave() {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  }

  function handleReset() {
    setUsers(deepCopyUsers(originalUsers));
  }

  const adminUsers = users.filter((u) => u.role === "admin");
  const employeeUsers = users.filter((u) => u.role === "employee");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Permissions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Grant or restrict permissions per employee — admins always have full access
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <>
              <Button variant="outline" size="sm" onClick={handleReset} className="h-9 text-sm">
                <RotateCcw className="size-4" data-icon="inline-start" />
                Reset
              </Button>
              <Button size="sm" onClick={handleSave} className="h-9 text-sm">
                <Save className="size-4" data-icon="inline-start" />
                Save Changes
              </Button>
            </>
          )}
          {savedToast && (
            <Badge variant="default" className="bg-emerald-500/15 text-emerald-400 text-xs h-9 px-3">
              Changes saved
            </Badge>
          )}
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm ring-1 ring-primary/10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="size-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Administrators</CardTitle>
                <CardDescription className="text-xs">
                  Full access to all resources — permissions cannot be modified
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-primary/15 text-primary text-[10px] px-2 py-0.5 font-medium">
              {adminUsers.length} admin{adminUsers.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {adminUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-lg bg-muted/20 px-4 py-2.5 border border-border/50"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {user.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <div className="flex gap-1.5 mt-0.5">
                    {ALL_ACTIONS.map((a) => (
                      <Badge
                        key={a}
                        className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0 font-medium"
                      >
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Employees</h2>
          <Badge variant="outline" className="text-xs ml-auto">
            {employeeUsers.length} employees
          </Badge>
        </div>

        {employeeUsers.map((user) => {
          const original = originalUsers.find((u) => u.id === user.id)!;
          const hasChanged = userHasChanges(user, original);

          return (
            <Card
              key={user.id}
              className={cn(
                "border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200",
                hasChanged && "ring-1 ring-primary/30"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                      {user.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-semibold">
                        {user.name}
                      </CardTitle>
                      {hasChanged && (
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 h-4 border-primary/30 text-primary font-medium"
                        >
                          unsaved
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      {user.email} &middot; {user.department}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-2 py-0.5 font-medium"
                  >
                    {user.permissions.length} permission{user.permissions.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALL_ACTIONS.map((action) => {
                    const enabled = user.permissions.includes(action);
                    const wasEnabled = original.permissions.includes(action);
                    const changed = enabled !== wasEnabled;
                    const meta = actionMeta[action];

                    return (
                      <div
                        key={action}
                        className={cn(
                          "flex items-center gap-3 rounded-lg p-3 transition-all duration-200",
                          enabled ? "bg-emerald-500/5" : "bg-muted/20",
                          changed && "ring-1 ring-primary/30 bg-primary/5"
                        )}
                      >
                        <div className={cn(
                          "size-8 rounded-lg flex items-center justify-center transition-colors duration-200 shrink-0",
                          enabled ? "bg-emerald-500/10" : "bg-muted"
                        )}>
                          {enabled ? (
                            <Unlock className="size-3.5 text-emerald-400" />
                          ) : (
                            <Lock className="size-3.5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{meta.label}</p>
                          <p className="text-xs text-muted-foreground">{meta.description}</p>
                        </div>
                        <Switch
                          checked={enabled}
                          onCheckedChange={() => togglePermission(user.id, action)}
                          className={cn(
                            "shrink-0",
                            enabled ? "data-[state=checked]:bg-emerald-500" : ""
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
