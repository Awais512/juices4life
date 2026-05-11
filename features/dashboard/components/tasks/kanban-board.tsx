"use client";

import { useCallback } from "react";
import { useTaskStore, getKanbanColumns } from "@/lib/store/task-store";
import type { TaskStatus, TaskItem } from "@/types";
import { TaskColumn } from "./task-column";
import { AddTaskDialog } from "./add-task-dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export function KanbanBoard() {
  const tasks = useTaskStore((s) => s.tasks);
  const moveTask = useTaskStore((s) => s.moveTask);
  const addTask = useTaskStore((s) => s.addTask);

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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-sm h-9 border-border/50">
            <Filter className="size-4" data-icon="inline-start" />
            Filter
          </Button>
          <AddTaskDialog onTaskCreate={handleTaskCreate} />
        </div>
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
