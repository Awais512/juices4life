export type UserRole = "admin" | "employee";

export type TaskStatus = "todo" | "in-progress" | "done";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type PermissionAction = "create" | "read" | "update" | "delete";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  createdAt: Date;
  isActive: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date | null;
  tags: string[];
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: TaskItem[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type RolePermissions = Record<UserRole, PermissionAction[]>;

export interface SidebarLink {
  label: string;
  href: string;
  icon: string;
}

export interface EmployeeFormData {
  name: string;
  email: string;
  role: UserRole;
  department: string;
}
