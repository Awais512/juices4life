import { KanbanBoard } from "@/features/dashboard/components/tasks/kanban-board";
import { requirePermission } from "@/lib/auth-guard";

export default async function TasksPage() {
  await requirePermission("tasks");
  return <KanbanBoard />;
}
