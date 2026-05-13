"use client";

import { useState, useMemo, useEffect } from "react";
import { useTaskStore, getBacklogTasks, getUserById } from "@/lib/store/task-store";
import { getPriorityColor } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddTaskDialog } from "../tasks/add-task-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowRight,
  Search,
  Calendar,
  User,
  Inbox,
  Lightbulb,
  Loader2,
} from "lucide-react";
import type { TaskItem, TaskStatus } from "@/types";

export function BacklogPage() {
  const tasks = useTaskStore((s) => s.tasks);
  const moveTask = useTaskStore((s) => s.moveTask);
  const addTask = useTaskStore((s) => s.addTask);
  const loaded = useTaskStore((s) => s.loaded);
  const loading = useTaskStore((s) => s.loading);
  const loadData = useTaskStore((s) => s.loadData);
  const users = useTaskStore((s) => s.users);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loaded && !loading) {
      loadData();
    }
  }, [loaded, loading, loadData]);

  const backlogTasks = useMemo(() => getBacklogTasks(tasks), [tasks]);

  const filtered = useMemo(
    () =>
      backlogTasks.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.tags.some((tag) => tag.includes(search.toLowerCase()))
      ),
    [backlogTasks, search]
  );

  function handleMoveToBoard(task: TaskItem) {
    moveTask(task.id, "todo");
  }

  function handleTaskCreate(newTask: TaskItem) {
    addTask({ ...newTask, status: "backlog" as TaskStatus });
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
              <Lightbulb className="size-6 text-amber-500" />
              Backlog
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ideas and tasks queued for future work
              {filtered.length > 0 && (
                <span className="ml-2 text-muted-foreground/60">
                  &middot; {filtered.length} item{filtered.length !== 1 && "s"}
                </span>
              )}
            </p>
          </div>
          <AddTaskDialog onTaskCreate={handleTaskCreate} defaultToBacklog />
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search backlog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-muted/50 border-none focus-visible:bg-background"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Inbox className="size-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium text-muted-foreground">
              {search ? "No matching items" : "Backlog is empty"}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {search
                ? "Try a different search term"
                : "Add ideas and tasks for future sprints"}
            </p>
          </div>
        ) : (
          <ScrollArea className="w-full">
            <div className="space-y-2 min-w-[600px]">
              {filtered.map((task) => {
                const assignee = getUserById(users, task.assigneeId);
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 rounded-lg border border-border/50 bg-card/30 hover:bg-card/60 px-4 py-3 transition-colors group"
                  >
                    <div className="size-2 rounded-full bg-violet-500/50 shrink-0" />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {task.tags.length > 0 && (
                        <div className="hidden sm:flex gap-1">
                          {task.tags.slice(0, 2).map((tag) => (
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

                      <Badge
                        className={cn(
                          "text-[10px] px-2 py-0.5 font-medium",
                          getPriorityColor(task.priority)
                        )}
                      >
                        {task.priority}
                      </Badge>

                      {task.dueDate && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Calendar className="size-3" />
                              <span className="hidden sm:inline">
                                {task.dueDate.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="text-xs">
                            Due {task.dueDate.toLocaleDateString()}
                          </TooltipContent>
                        </Tooltip>
                      )}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="size-6">
                            <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                              {assignee?.avatar ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">
                          {assignee?.name ?? "Unassigned"}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                            onClick={() => handleMoveToBoard(task)}
                          >
                            <ArrowRight className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          Move to To Do
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </TooltipProvider>
  );
}
