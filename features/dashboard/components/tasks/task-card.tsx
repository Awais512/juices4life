"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getMockUserById, getPriorityColor } from "@/lib/mock-data";
import type { TaskItem, TaskStatus } from "@/types";
import { Calendar, User, ArrowRight, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: TaskItem;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const assignee = getMockUserById(task.assigneeId);

  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  }

  function handleDragEnd() {
    setIsDragging(false);
  }

  return (
    <TooltipProvider>
      <>
        <Card
          draggable
          data-task-id={task.id}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className={cn(
            "group cursor-grab active:cursor-grabbing border-border/50 bg-card/50 hover:bg-card/80 hover:border-primary/20 transition-all duration-200",
            isDragging && "opacity-50 scale-95 rotate-[2deg]"
          )}
          onClick={() => setOpen(true)}
        >
          <CardContent className="p-3 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn(
                  "size-2 rounded-full shrink-0 mt-1.5",
                  task.status === "todo" && "bg-muted-foreground",
                  task.status === "in-progress" && "bg-primary",
                  task.status === "done" && "bg-emerald-500"
                )} />
                <h4 className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                  {task.title}
                </h4>
              </div>
            </div>

            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 font-medium capitalize"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <Badge className={cn("text-[10px] px-2 py-0.5 font-medium", getPriorityColor(task.priority))}>
                {task.priority}
              </Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="size-6">
                    <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                      {assignee?.avatar ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {assignee?.name ?? "Unassigned"}
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-lg border-border/50 bg-card">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                <div className={cn(
                  "size-2.5 rounded-full",
                  task.status === "todo" && "bg-muted-foreground",
                  task.status === "in-progress" && "bg-primary",
                  task.status === "done" && "bg-emerald-500"
                )} />
                {task.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground pt-1">
                Created {task.createdAt.toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              <p className="text-sm text-foreground leading-relaxed">
                {task.description}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <User className="size-3" />
                    Assignee
                  </span>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                        {assignee?.avatar ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">{assignee?.name ?? "Unassigned"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Tag className="size-3" />
                    Priority
                  </span>
                  <Badge className={cn("text-xs px-2 py-0.5 font-medium", getPriorityColor(task.priority))}>
                    {task.priority}
                  </Badge>
                </div>

                {task.dueDate && (
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                      <Calendar className="size-3" />
                      Due date
                    </span>
                    <span className="text-sm text-foreground">
                      {task.dueDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <ArrowRight className="size-3" />
                    Status
                  </span>
                  <Select
                    value={task.status}
                    onValueChange={(value) => {
                      onStatusChange(task.id, value as TaskStatus);
                      setOpen(false);
                    }}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {task.tags.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground font-medium">Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs capitalize">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    </TooltipProvider>
  );
}
