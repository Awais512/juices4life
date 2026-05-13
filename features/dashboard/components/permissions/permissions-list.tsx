"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User, ResourceType, PermissionAction, PermissionMap } from "@/types";
import { ALL_RESOURCES, ALL_ACTIONS, resourceLabels } from "@/features/auth/utils/permissions";
import { updateUserPermissions } from "@/features/auth/actions/invite-actions";
import { Save, RotateCcw, ShieldCheck, Users, Check } from "lucide-react";
import { cn } from "@/lib/utils";

function cloneUsers(users: User[]): User[] {
  return users.map((u) => ({
    ...u,
    permissions: Object.fromEntries(
      ALL_RESOURCES.map((r) => [r, [...u.permissions[r]]])
    ) as PermissionMap,
  }));
}

function deepEqual(a: PermissionMap, b: PermissionMap): boolean {
  for (const resource of ALL_RESOURCES) {
    const arrA = [...a[resource]].sort();
    const arrB = [...b[resource]].sort();
    if (arrA.length !== arrB.length || arrA.some((v, i) => v !== arrB[i])) {
      return false;
    }
  }
  return true;
}

export function PermissionsList({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(() => cloneUsers(initialUsers));
  const [originalUsers] = useState(() => cloneUsers(initialUsers));
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const dirtyUsers = users.filter((u, i) => !deepEqual(u.permissions, originalUsers[i].permissions));
  const isDirty = dirtyUsers.length > 0;

  const adminUsers = users.filter((u) => u.role === "admin");
  const employeeUsers = users.filter((u) => u.role === "employee");

  const togglePermission = useCallback((userId: string, resource: ResourceType, action: PermissionAction) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId || u.role === "admin") return u;
        const perms = { ...u.permissions };
        const actions = [...perms[resource]];
        const idx = actions.indexOf(action);
        if (idx >= 0) {
          actions.splice(idx, 1);
        } else {
          actions.push(action);
        }
        perms[resource] = actions;
        return { ...u, permissions: perms };
      })
    );
  }, []);

  async function handleSave() {
    setSaving(true);
    for (const user of dirtyUsers) {
      const result = await updateUserPermissions(user.id, user.permissions);
      if (!result.success) {
        console.error("Failed to save permissions for", user.name, result.error);
      }
    }
    setSaving(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  }

  function handleReset() {
    setUsers(cloneUsers(originalUsers));
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Permissions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Grant or restrict resource-level permissions per employee — admins always have full access
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <>
              <Button variant="outline" size="sm" onClick={handleReset} className="h-9 text-sm">
                <RotateCcw className="size-4" />
                Reset
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="h-9 text-sm">
                <Save className="size-4" />
                {saving ? "Saving..." : "Save Changes"}
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
                    {ALL_RESOURCES.map((r) => (
                      <Badge
                        key={r}
                        className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0 font-medium"
                      >
                        {r}
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
            {employeeUsers.length} employee{employeeUsers.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        {employeeUsers.length === 0 ? (
          <Card className="border-border/50 bg-card/50">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No employees yet. Invite employees from the Employees page.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-card z-10 min-w-[180px] px-3 py-2 text-left text-xs font-medium text-muted-foreground border-b border-border/50">
                    Employee
                  </th>
                  {ALL_RESOURCES.map((resource) => (
                    <th
                      key={resource}
                      colSpan={4}
                      className="px-1 py-2 text-center text-xs font-medium text-muted-foreground border-b border-border/50 bg-muted/20 min-w-[120px]"
                    >
                      {resourceLabels(resource)}
                    </th>
                  ))}
                </tr>
                <tr>
                  <th className="sticky left-0 bg-card z-10 px-3 py-1 border-b border-border/50" />
                  {ALL_RESOURCES.flatMap((resource) =>
                    ALL_ACTIONS.map((action) => (
                      <th
                        key={`${resource}-${action}`}
                        className="px-1 py-1 text-center text-[10px] font-medium text-muted-foreground border-b border-border/50 uppercase tracking-wider"
                      >
                        {action.slice(0, 4)}
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {employeeUsers.map((user) => {
                  const original = originalUsers.find((u) => u.id === user.id)!;
                  const hasChanges = !deepEqual(user.permissions, original.permissions);

                  return (
                    <tr
                      key={user.id}
                      className={cn(
                        "transition-colors hover:bg-muted/20",
                        hasChanges && "bg-primary/5"
                      )}
                    >
                      <td className="sticky left-0 bg-card z-10 px-3 py-2.5 border-b border-border/50">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-7 shrink-0">
                            <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                              {user.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {user.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {user.department}
                            </p>
                          </div>
                          {hasChanges && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1 py-0 h-3.5 border-primary/30 text-primary font-medium shrink-0"
                            >
                              *
                            </Badge>
                          )}
                        </div>
                      </td>
                      {ALL_RESOURCES.flatMap((resource) =>
                        ALL_ACTIONS.map((action) => {
                          const enabled = user.permissions[resource].includes(action);
                          const wasEnabled = original.permissions[resource].includes(action);
                          const changed = enabled !== wasEnabled;

                          return (
                            <td
                              key={`${user.id}-${resource}-${action}`}
                              className={cn(
                                "px-1 py-2.5 text-center border-b border-border/50 transition-colors cursor-pointer",
                                changed && "bg-primary/10"
                              )}
                              onClick={() => togglePermission(user.id, resource, action)}
                            >
                              <div className={cn(
                                "size-4 rounded mx-auto transition-colors border",
                                enabled
                                  ? "bg-emerald-500 border-emerald-500 flex items-center justify-center"
                                  : "bg-transparent border-muted-foreground/30 hover:border-muted-foreground/60"
                              )}>
                                {enabled && <Check className="size-3 text-white stroke-[3]" />}
                              </div>
                            </td>
                          );
                        })
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}