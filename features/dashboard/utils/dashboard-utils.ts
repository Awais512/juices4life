import type { TaskItem } from "@/types";
import type { DashboardStats } from "../types/dashboard-types";

export function getDashboardStats(tasks: TaskItem[], employeeCount: number): DashboardStats {
  return {
    totalTasks: tasks.length,
    tasksInProgress: tasks.filter((t) => t.status === "in-progress").length,
    tasksInReview: tasks.filter((t) => t.status === "review").length,
    tasksDone: tasks.filter((t) => t.status === "done").length,
    totalEmployees: employeeCount,
  };
}
