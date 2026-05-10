"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_USERS } from "@/lib/mock-data";
import type { User, UserRole, PermissionAction } from "@/types";
import { Plus, Search, Edit2, Trash2, X, Check, Shield, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_ACTIONS: PermissionAction[] = ["create", "read", "update", "delete"];

const actionLabels: Record<PermissionAction, string> = {
  create: "Create",
  read: "Read",
  update: "Update",
  delete: "Delete",
};

export function EmployeesTable() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [addRole, setAddRole] = useState<UserRole>("employee");
  const [addPermissions, setAddPermissions] = useState<PermissionAction[]>(["read"]);

  const [editPermissions, setEditPermissions] = useState<PermissionAction[]>([]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  function handleDelete(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeleteConfirm(null);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setEditPermissions([...user.permissions]);
    setIsEditOpen(true);
  }

  function handleSaveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingUser) return;
    const formData = new FormData(event.currentTarget);
    const role = (formData.get("edit-role") as UserRole) || editingUser.role;
    const perms = role === "admin" ? [...ALL_ACTIONS] : editPermissions;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: (formData.get("edit-name") as string) || u.name,
              email: (formData.get("edit-email") as string) || u.email,
              role,
              department: (formData.get("edit-dept") as string) || u.department,
              permissions: perms,
            }
          : u
      )
    );
    setIsEditOpen(false);
    setEditingUser(null);
  }

  function toggleAddPermission(action: PermissionAction) {
    setAddPermissions((prev) =>
      prev.includes(action)
        ? prev.filter((a) => a !== action)
        : [...prev, action]
    );
  }

  function toggleEditPermission(action: PermissionAction) {
    setEditPermissions((prev) =>
      prev.includes(action)
        ? prev.filter((a) => a !== action)
        : [...prev, action]
    );
  }

  function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const role = (formData.get("add-role") as UserRole) || "employee";
    const perms = role === "admin" ? [...ALL_ACTIONS] : addPermissions;

    const newUser: User = {
      id: `u${Date.now()}`,
      name: formData.get("add-name") as string,
      email: formData.get("add-email") as string,
      role,
      department: (formData.get("add-dept") as string) || "General",
      avatar: ((formData.get("add-name") as string)?.split(" ").map((n) => n[0]).join("") || "?").slice(0, 2).toUpperCase(),
      createdAt: new Date(),
      isActive: true,
      permissions: perms,
    };
    setUsers((prev) => [...prev, newUser]);
    setIsAddOpen(false);
    setAddRole("employee");
    setAddPermissions(["read"]);
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
        <Dialog
          open={isAddOpen}
          onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) {
              setAddRole("employee");
              setAddPermissions(["read"]);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="text-sm h-9">
              <Plus className="size-4" data-icon="inline-start" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md border-border/50 bg-card">
            <DialogHeader>
              <DialogTitle>Add Employee</DialogTitle>
              <DialogDescription>
                Add a new team member and set their permissions
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd}>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="add-name">Full name</Label>
                  <Input id="add-name" name="add-name" placeholder="John Doe" required className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-email">Email</Label>
                  <Input id="add-email" name="add-email" type="email" placeholder="john@juices4life.com" required className="h-10" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-role">Role</Label>
                    <Select
                      name="add-role"
                      value={addRole}
                      onValueChange={(v) => {
                        setAddRole(v as UserRole);
                        if (v === "admin") setAddPermissions([...ALL_ACTIONS]);
                      }}
                    >
                      <SelectTrigger id="add-role" className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-dept">Department</Label>
                    <Input id="add-dept" name="add-dept" placeholder="Engineering" className="h-10" />
                  </div>
                </div>

                {addRole === "employee" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <Shield className="size-3.5 text-muted-foreground" />
                      Permissions
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {ALL_ACTIONS.map((action) => {
                        const enabled = addPermissions.includes(action);
                        return (
                          <div
                            key={action}
                            className={cn(
                              "flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors",
                              enabled ? "bg-emerald-500/5" : "bg-muted/20"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {enabled ? (
                                <Unlock className="size-3.5 text-emerald-400" />
                              ) : (
                                <Lock className="size-3.5 text-muted-foreground" />
                              )}
                              <span className="text-sm text-foreground">{actionLabels[action]}</span>
                            </div>
                            <Switch
                              checked={enabled}
                              onCheckedChange={() => toggleAddPermission(action)}
                              className={cn(enabled ? "data-[state=checked]:bg-emerald-500" : "")}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Employee</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
              {filteredUsers.map((user) => (
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
                      {ALL_ACTIONS.map((action) => (
                        <Badge
                          key={action}
                          className={cn(
                            "text-[9px] px-1.5 py-0 font-medium",
                            user.permissions.includes(action)
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-muted/30 text-muted-foreground/50"
                          )}
                        >
                          {action}
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openEdit(user)}
                          >
                            <Edit2 className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteConfirm(user.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
                      if (v === "admin") setEditPermissions([...ALL_ACTIONS]);
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
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Shield className="size-3.5 text-muted-foreground" />
                    Permissions
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_ACTIONS.map((action) => {
                      const enabled = editPermissions.includes(action);
                      return (
                        <div
                          key={action}
                          className={cn(
                            "flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors",
                            enabled ? "bg-emerald-500/5" : "bg-muted/20"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {enabled ? (
                              <Unlock className="size-3.5 text-emerald-400" />
                            ) : (
                              <Lock className="size-3.5 text-muted-foreground" />
                            )}
                            <span className="text-sm text-foreground">{actionLabels[action]}</span>
                          </div>
                          <Switch
                            checked={enabled}
                            onCheckedChange={() => toggleEditPermission(action)}
                            className={cn(enabled ? "data-[state=checked]:bg-emerald-500" : "")}
                          />
                        </div>
                      );
                    })}
                  </div>
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
