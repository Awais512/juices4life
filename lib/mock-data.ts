import type { User, TaskItem, KanbanColumn, RolePermissions, SidebarLink } from "@/types";

export const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "Abdul Wahab",
    email: "abdul@juices4life.com",
    role: "admin",
    avatar: "AW",
    department: "Management",
    createdAt: new Date("2024-01-15"),
    isActive: true,
  },
  {
    id: "u2",
    name: "Yasine",
    email: "yasine@juices4life.com",
    role: "employee",
    avatar: "Y",
    department: "Production",
    createdAt: new Date("2024-02-20"),
    isActive: true,
  },
  {
    id: "u3",
    name: "Syed Mohsin",
    email: "mohsin@juices4life.com",
    role: "employee",
    avatar: "SM",
    department: "Sales",
    createdAt: new Date("2024-03-10"),
    isActive: true,
  },
  {
    id: "u4",
    name: "Shakira",
    email: "shakira@juices4life.com",
    role: "employee",
    avatar: "S",
    department: "Marketing",
    createdAt: new Date("2024-04-05"),
    isActive: true,
  },
  {
    id: "u5",
    name: "Elena Torres",
    email: "elena@juices4life.com",
    role: "employee",
    avatar: "ET",
    department: "Product",
    createdAt: new Date("2024-05-12"),
    isActive: true,
  },
  {
    id: "u6",
    name: "Frank Okafor",
    email: "frank@juices4life.com",
    role: "admin",
    avatar: "FO",
    department: "Operations",
    createdAt: new Date("2024-01-01"),
    isActive: true,
  },
];

export const MOCK_TASKS: TaskItem[] = [
  {
    id: "t1",
    title: "Redesign landing page",
    description: "Create a modern, conversion-focused landing page with updated brand guidelines and responsive layouts for all device sizes.",
    status: "todo",
    priority: "high",
    assigneeId: "u2",
    createdBy: "u1",
    createdAt: new Date("2025-05-01"),
    updatedAt: new Date("2025-05-01"),
    dueDate: new Date("2025-05-20"),
    tags: ["design", "frontend"],
  },
  {
    id: "t2",
    title: "Implement user authentication",
    description: "Set up OAuth 2.0 integration with Google and GitHub providers, including session management and refresh token rotation.",
    status: "todo",
    priority: "urgent",
    assigneeId: "u4",
    createdBy: "u1",
    createdAt: new Date("2025-05-02"),
    updatedAt: new Date("2025-05-02"),
    dueDate: new Date("2025-05-15"),
    tags: ["backend", "security"],
  },
  {
    id: "t3",
    title: "Build dashboard analytics",
    description: "Design and implement interactive charts for user engagement metrics, revenue tracking, and real-time data visualization.",
    status: "in-progress",
    priority: "high",
    assigneeId: "u4",
    createdBy: "u1",
    createdAt: new Date("2025-04-28"),
    updatedAt: new Date("2025-05-05"),
    dueDate: new Date("2025-05-18"),
    tags: ["frontend", "analytics"],
  },
  {
    id: "t4",
    title: "Write API documentation",
    description: "Document all REST API endpoints with request/response examples, authentication requirements, and error codes using OpenAPI spec.",
    status: "in-progress",
    priority: "medium",
    assigneeId: "u3",
    createdBy: "u6",
    createdAt: new Date("2025-04-25"),
    updatedAt: new Date("2025-05-03"),
    dueDate: new Date("2025-05-12"),
    tags: ["docs", "backend"],
  },
  {
    id: "t5",
    title: "Fix payment gateway timeout",
    description: "Investigate and resolve the 30-second timeout issue with Stripe payment processing during high-traffic periods.",
    status: "done",
    priority: "urgent",
    assigneeId: "u4",
    createdBy: "u1",
    createdAt: new Date("2025-04-20"),
    updatedAt: new Date("2025-04-25"),
    dueDate: new Date("2025-04-28"),
    tags: ["backend", "bug"],
  },
  {
    id: "t6",
    title: "Create onboarding flow",
    description: "Design a guided onboarding experience with interactive tutorial steps, tooltips, and progress tracking for new users.",
    status: "in-progress",
    priority: "high",
    assigneeId: "u2",
    createdBy: "u6",
    createdAt: new Date("2025-04-30"),
    updatedAt: new Date("2025-05-04"),
    dueDate: new Date("2025-05-22"),
    tags: ["design", "ux"],
  },
  {
    id: "t7",
    title: "Set up CI/CD pipeline",
    description: "Configure GitHub Actions for automated testing, linting, and deployment to staging and production environments.",
    status: "done",
    priority: "medium",
    assigneeId: "u4",
    createdBy: "u1",
    createdAt: new Date("2025-04-15"),
    updatedAt: new Date("2025-04-22"),
    dueDate: new Date("2025-04-30"),
    tags: ["devops", "infra"],
  },
  {
    id: "t8",
    title: "Email template redesign",
    description: "Update transactional email templates with new branding, responsive design, and better accessibility compliance.",
    status: "todo",
    priority: "low",
    assigneeId: "u2",
    createdBy: "u3",
    createdAt: new Date("2025-05-03"),
    updatedAt: new Date("2025-05-03"),
    dueDate: null,
    tags: ["design", "marketing"],
  },
  {
    id: "t9",
    title: "Database migration plan",
    description: "Plan the migration from PostgreSQL 14 to 16, including zero-downtime strategy, rollback procedures, and performance benchmarking.",
    status: "todo",
    priority: "medium",
    assigneeId: "u4",
    createdBy: "u6",
    createdAt: new Date("2025-05-04"),
    updatedAt: new Date("2025-05-04"),
    dueDate: new Date("2025-06-01"),
    tags: ["backend", "infra"],
  },
  {
    id: "t10",
    title: "Q2 Marketing campaign",
    description: "Plan and execute the Q2 digital marketing campaign including social media, email sequences, and paid advertising.",
    status: "done",
    priority: "high",
    assigneeId: "u3",
    createdBy: "u1",
    createdAt: new Date("2025-04-01"),
    updatedAt: new Date("2025-04-28"),
    dueDate: new Date("2025-04-30"),
    tags: ["marketing"],
  },
];

export const ROLE_PERMISSIONS: RolePermissions = {
  admin: ["create", "read", "update", "delete"],
  employee: ["read"],
};

export const MOCK_CURRENT_USER: User = MOCK_USERS[0];

export function getMockUserById(id: string): User | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}

export function getKanbanColumns(): KanbanColumn[] {
  const columns: KanbanColumn[] = [
    { id: "todo", title: "To Do", tasks: [] },
    { id: "in-progress", title: "In Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
  ];

  for (const task of MOCK_TASKS) {
    const column = columns.find((c) => c.id === task.status);
    if (column) {
      column.tasks.push(task);
    }
  }

  return columns;
}

export const SIDEBAR_LINKS: SidebarLink[] = [
  { label: "Dashboard", href: "/", icon: "LayoutDashboard" },
  { label: "Tasks", href: "/tasks", icon: "CheckSquare" },
  { label: "Employees", href: "/employees", icon: "Users" },
  { label: "Permissions", href: "/permissions", icon: "Shield" },
];

export function getStatusColor(status: TaskItem["status"]): string {
  switch (status) {
    case "todo": return "text-muted-foreground";
    case "in-progress": return "text-primary";
    case "done": return "text-emerald-500";
  }
}

export function getPriorityColor(priority: TaskItem["priority"]): string {
  switch (priority) {
    case "low": return "bg-slate-500/10 text-slate-400";
    case "medium": return "bg-blue-500/10 text-blue-400";
    case "high": return "bg-amber-500/10 text-amber-400";
    case "urgent": return "bg-red-500/10 text-red-400";
  }
}
