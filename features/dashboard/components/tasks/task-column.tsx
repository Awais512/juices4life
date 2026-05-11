"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { KanbanColumn as KanbanColumnType, TaskStatus } from "@/types";
import { TaskCard } from "./task-card";
import { GripVertical, Ban } from "lucide-react";
import { canTransition } from "./transitions";

interface TaskColumnProps {
  column: KanbanColumnType;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const columnStyles: Record<TaskStatus, { accent: string; label: string }> = {
  todo: { accent: "bg-muted-foreground", label: "text-muted-foreground" },
  "in-progress": { accent: "bg-primary", label: "text-primary" },
  review: { accent: "bg-violet-500", label: "text-violet-500" },
  done: { accent: "bg-emerald-500", label: "text-emerald-500" },
};

export function TaskColumn({ column, onStatusChange }: TaskColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isInvalidTarget, setIsInvalidTarget] = useState(false);
  const style = columnStyles[column.id];

  function parseDragData(e: React.DragEvent): { id: string; fromStatus: TaskStatus } | null {
    try {
      return JSON.parse(e.dataTransfer.getData("text/plain"));
    } catch {
      return null;
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    const data = parseDragData(e);
    if (data && !canTransition(data.fromStatus, column.id)) {
      e.dataTransfer.dropEffect = "none";
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const data = parseDragData(e);
    if (data && !canTransition(data.fromStatus, column.id)) {
      setIsInvalidTarget(true);
      return;
    }
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    const relatedTarget = e.relatedTarget as Node | null;
    if (!e.currentTarget.contains(relatedTarget)) {
      setIsDragOver(false);
      setIsInvalidTarget(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    setIsInvalidTarget(false);

    const data = parseDragData(e);
    if (!data) return;
    if (!canTransition(data.fromStatus, column.id)) return;

    onStatusChange(data.id, column.id);
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
          isDragOver && !isInvalidTarget && "bg-primary/5 ring-2 ring-primary/30 ring-dashed",
          isInvalidTarget && "bg-destructive/5 ring-2 ring-destructive/30 ring-dashed"
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
              isDragOver && !isInvalidTarget
                ? "border-primary/40 bg-primary/5"
                : isInvalidTarget
                  ? "border-destructive/40 bg-destructive/5"
                  : "border-border/50 bg-muted/10"
            )}
          >
            {isInvalidTarget ? (
              <>
                <Ban className="size-6 mb-2 text-destructive/40" />
                <p className="text-xs font-medium text-destructive/60">
                  Invalid transition
                </p>
              </>
            ) : (
              <>
                <GripVertical className={cn("size-6 mb-2", isDragOver ? "text-primary/40" : "text-muted-foreground/40")} />
                <p className={cn("text-xs font-medium", isDragOver ? "text-primary/60" : "text-muted-foreground/60")}>
                  {isDragOver ? "Drop here" : "No tasks yet"}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
