"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User, UserRole, ResourceType, PermissionAction, PermissionMap } from "@/types";
import { updateUserPermissions, deleteUserAction, updateEmployeeAction } from "@/features/auth/actions/invite-actions";
import { ALL_RESOURCES, ALL_ACTIONS, resourceLabels } from "@/features/auth/utils/permissions";
import { Search, Edit2, Trash2, X, Check, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { InviteDialog } from "./invite-dialog";
import { useCan } from "@/features/auth/utils/use-can";
import { useUser } from "@/features/auth/components/user-provider";

export function EmployeesTable({
  initialEmployees,
}: {
  initialEmployees: User[];
}) {
  const [users, setUsers] = useState<User[]>(initialEmployees);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<PermissionMap>({
    tasks: [], backlog: [], employees: [], permissions: []
  });

  const canUpdateEmp = useCan("update", "employees");
  const canDeleteEmp = useCan("delete", "employees");
  const currentUser = useUser();

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string) {
    await deleteUserAction(id);
    window.location.reload();
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setEditPermissions(
      Object.fromEntries(
        ALL_RESOURCES.map((r) => [r, [...user.permissions[r]]])
      ) as PermissionMap
    );
    setIsEditOpen(true);
  }

  async function handleSaveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingUser) return;
    const formData = new FormData(event.currentTarget);
    const name = (formData.get("edit-name") as string) || editingUser.name;
    const email = (formData.get("edit-email") as string) || editingUser.email;
    const role = (formData.get("edit-role") as UserRole) || editingUser.role;
    const department = (formData.get("edit-dept") as string) || editingUser.department;

    await updateEmployeeAction(editingUser.id, { name, email, role, department });

    const perms = role === "admin"
      ? { tasks: [...ALL_ACTIONS], backlog: [...ALL_ACTIONS], employees: [...ALL_ACTIONS], permissions: [...ALL_ACTIONS] }
      : editPermissions;

    await updateUserPermissions(editingUser.id, perms);
    window.location.reload();
  }

  function toggleEditPermission(resource: ResourceType, action: PermissionAction) {
    setEditPermissions((prev) => {
      const actions = new Set(prev[resource]);

      if (actions.has(action)) {
        actions.delete(action);
        if (action === "read") {
          actions.delete("create");
          actions.delete("update");
          actions.delete("delete");
        }
      } else {
        actions.add(action);
        if (action !== "read") {
          actions.add("read");
        }
      }

      return { ...prev, [resource]: [...actions] };
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Employees</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your team members, their roles, and individual permissions
          </p>
        </div>
        <InviteDialog />
      </div>

      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-9 text-sm"
              />
            </div>
            <Badge variant="outline" className="text-xs">
              {filteredUsers.length} members
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs font-medium text-muted-foreground h-10">Name</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground h-10 hidden sm:table-cell">Email</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground h-10">Role</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground h-10 hidden md:table-cell">Permissions</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground h-10 hidden md:table-cell">Status</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground h-10 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const isOtherAdmin = user.role === "admin" && user.id !== currentUser?.id;
                return (
                <TableRow key={user.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className={cn(
                        "text-[10px] px-2 py-0.5 font-medium capitalize",
                        user.role === "admin" && "bg-primary/15 text-primary hover:bg-primary/20"
                      )}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 hidden md:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {ALL_RESOURCES.map((resource) => (
                        <Badge
                          key={resource}
                          className={cn(
                            "text-[9px] px-1.5 py-0 font-medium capitalize",
                            user.permissions[resource].length > 0
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-muted/30 text-muted-foreground/50"
                          )}
                        >
                          {resource}:{user.permissions[resource].length}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "size-1.5 rounded-full",
                        user.isActive ? "bg-emerald-500" : "bg-muted-foreground/50"
                      )} />
                      <span className="text-sm text-muted-foreground">
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {deleteConfirm === user.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Check className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-foreground"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          {canUpdateEmp && !isOtherAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-foreground"
                              onClick={() => openEdit(user)}
                            >
                              <Edit2 className="size-3.5" />
                            </Button>
                          )}
                          {canDeleteEmp && !isOtherAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteConfirm(user.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setEditingUser(null);
        }}
      >
        <DialogContent className="sm:max-w-md border-border/50 bg-card">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update team member information and permissions
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full name</Label>
                <Input
                  id="edit-name"
                  name="edit-name"
                  defaultValue={editingUser?.name}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="edit-email"
                  type="email"
                  defaultValue={editingUser?.email}
                  className="h-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    name="edit-role"
                    defaultValue={editingUser?.role}
                    onValueChange={(v) => {
                      if (v === "admin") setEditPermissions({
                        tasks: [...ALL_ACTIONS],
                        backlog: [...ALL_ACTIONS],
                        employees: [...ALL_ACTIONS],
                        permissions: [...ALL_ACTIONS],
                      });
                    }}
                  >
                    <SelectTrigger id="edit-role" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dept">Department</Label>
                  <Input
                    id="edit-dept"
                    name="edit-dept"
                    defaultValue={editingUser?.department}
                    className="h-10"
                  />
                </div>
              </div>

              {editingUser?.role !== "admin" && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Shield className="size-3.5 text-muted-foreground" />
                    Resource Permissions
                  </Label>
                  {ALL_RESOURCES.map((resource) => (
                    <div key={resource} className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {resourceLabels(resource)}
                      </p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {ALL_ACTIONS.map((action) => {
                          const enabled = editPermissions[resource].includes(action);
                          return (
                            <button
                              key={action}
                              type="button"
                              onClick={() => toggleEditPermission(resource, action)}
                              className={cn(
                                "text-[11px] px-2 py-1.5 rounded-md border text-center transition-colors capitalize",
                                enabled
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium"
                                  : "bg-muted/20 border-border/50 text-muted-foreground hover:border-muted-foreground/30"
                              )}
                            >
                              {action}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
