import type { TaskItem, User, KanbanColumn } from "@/types";

export type { TaskItem, User, KanbanColumn };

export interface DashboardStats {
  totalTasks: number;
  tasksInProgress: number;
  tasksDone: number;
  totalEmployees: number;
}
