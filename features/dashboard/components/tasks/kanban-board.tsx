"use client";

import { useEffect, useCallback } from "react";
import { useTaskStore, getKanbanColumns } from "@/lib/store/task-store";
import type { TaskStatus, TaskItem } from "@/types";
import { TaskColumn } from "./task-column";
import { AddTaskDialog } from "./add-task-dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useCan } from "@/features/auth/utils/use-can";
import { Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function KanbanBoard() {
  const tasks = useTaskStore((s) => s.tasks);
  const moveTask = useTaskStore((s) => s.moveTask);
  const addTask = useTaskStore((s) => s.addTask);
  const loadData = useTaskStore((s) => s.loadData);
  const loaded = useTaskStore((s) => s.loaded);
  const loading = useTaskStore((s) => s.loading);
  const canCreate = useCan("create", "tasks");

  useEffect(() => {
    if (!loaded && !loading) {
      loadData();
    }
  }, [loaded, loading, loadData]);

  const columns = getKanbanColumns(tasks);

  const handleTaskCreate = useCallback(
    (task: TaskItem) => {
      addTask(task);
    },
    [addTask]
  );

  const handleStatusChange = useCallback(
    (taskId: string, newStatus: TaskStatus) => {
      moveTask(taskId, newStatus);
    },
    [moveTask]
  );

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Tasks
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Drag tasks between columns or use workflow actions to change status
          </p>
        </div>
        {canCreate && (
          <AddTaskDialog onTaskCreate={handleTaskCreate} />
        )}
      </div>

      <ScrollArea className="w-full pb-4">
        <div className="flex gap-6 min-w-[900px]">
          {columns.map((column) => (
            <TaskColumn
              key={column.id}
              column={column}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
