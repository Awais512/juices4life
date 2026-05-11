import {
  MOCK_TASKS,
  MOCK_USERS,
} from "@/lib/mock-data";
import type { DashboardStats } from "../types/dashboard-types";

export function getDashboardStats(): DashboardStats {
  return {
    totalTasks: MOCK_TASKS.length,
    tasksInProgress: MOCK_TASKS.filter((t) => t.status === "in-progress").length,
    tasksInReview: MOCK_TASKS.filter((t) => t.status === "review").length,
    tasksDone: MOCK_TASKS.filter((t) => t.status === "done").length,
    totalEmployees: MOCK_USERS.filter((u) => u.role === "employee").length,
  };
}
