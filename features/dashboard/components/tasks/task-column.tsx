"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { KanbanColumn as KanbanColumnType, TaskStatus } from "@/types";
import { TaskCard } from "./task-card";
import { GripVertical } from "lucide-react";

interface TaskColumnProps {
  column: KanbanColumnType;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const columnStyles: Record<TaskStatus, { accent: string; label: string }> = {
  todo: { accent: "bg-muted-foreground", label: "text-muted-foreground" },
  "in-progress": { accent: "bg-primary", label: "text-primary" },
  done: { accent: "bg-emerald-500", label: "text-emerald-500" },
};

export function TaskColumn({ column, onStatusChange }: TaskColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const style = columnStyles[column.id];

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    const relatedTarget = e.relatedTarget as Node | null;
    if (!e.currentTarget.contains(relatedTarget)) {
      setIsDragOver(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onStatusChange(taskId, column.id);
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-col flex-1 min-w-[280px] max-w-[400px]"
    >
      <div className="flex items-center gap-2 px-1 pb-4">
        <div className={cn("size-2.5 rounded-full", style.accent)} />
        <h3 className={cn("text-sm font-semibold tracking-tight", style.label)}>
          {column.title}
        </h3>
        <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
          {column.tasks.length}
        </span>
      </div>

      <div
        className={cn(
          "flex flex-col gap-3 min-h-[200px] rounded-xl transition-all duration-200",
          isDragOver && "bg-primary/5 ring-2 ring-primary/30 ring-dashed"
        )}
      >
        {column.tasks.map((task) => (
          <div key={task.id} className="animate-fade-in">
            <TaskCard task={task} onStatusChange={onStatusChange} />
          </div>
        ))}
        {column.tasks.length === 0 && (
          <div
            className={cn(
              "flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl transition-all duration-200",
              isDragOver
                ? "border-primary/40 bg-primary/5"
                : "border-border/50 bg-muted/10"
            )}
          >
            <GripVertical className={cn("size-6 mb-2", isDragOver ? "text-primary/40" : "text-muted-foreground/40")} />
            <p className={cn("text-xs font-medium", isDragOver ? "text-primary/60" : "text-muted-foreground/60")}>
              {isDragOver ? "Drop here" : "No tasks yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
