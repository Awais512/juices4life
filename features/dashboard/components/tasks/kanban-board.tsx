"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTaskStore, getKanbanColumns, getUserById } from "@/lib/store/task-store";
import type { TaskStatus, TaskItem, TaskPriority } from "@/types";
import { TaskColumn } from "./task-column";
import { AddTaskDialog } from "./add-task-dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCan } from "@/features/auth/utils/use-can";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];

export function KanbanBoard() {
  const tasks = useTaskStore((s) => s.tasks);
  const users = useTaskStore((s) => s.users);
  const moveTask = useTaskStore((s) => s.moveTask);
  const addTask = useTaskStore((s) => s.addTask);
  const loadData = useTaskStore((s) => s.loadData);
  const loaded = useTaskStore((s) => s.loaded);
  const loading = useTaskStore((s) => s.loading);
  const canCreate = useCan("create", "tasks");

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!loaded && !loading) {
      loadData();
    }
  }, [loaded, loading, loadData]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.includes(q))
      );
    }
    if (priorityFilter.length > 0) {
      filtered = filtered.filter((t) => priorityFilter.includes(t.priority));
    }
    if (assigneeFilter) {
      filtered = filtered.filter((t) => t.assigneeId === assigneeFilter);
    }
    return filtered;
  }, [tasks, search, priorityFilter, assigneeFilter]);

  const columns = getKanbanColumns(filteredTasks);
  const hasFilters = search.trim() || priorityFilter.length > 0 || assigneeFilter;

  function clearFilters() {
    setSearch("");
    setPriorityFilter([]);
    setAssigneeFilter(null);
  }

  function togglePriority(p: TaskPriority) {
    setPriorityFilter((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

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

  const totalCount = tasks.filter((t) => t.status !== "backlog").length;
  const filteredCount = filteredTasks.filter((t) => t.status !== "backlog").length;

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

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 text-sm gap-2",
                hasFilters && "border-primary/50 text-primary"
              )}
            >
              <SlidersHorizontal className="size-4" />
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Priority</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRIORITIES.map((p) => (
                    <label
                      key={p}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm cursor-pointer transition-colors",
                        priorityFilter.includes(p)
                          ? "bg-primary/10 text-foreground"
                          : "hover:bg-muted/50 text-muted-foreground"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={priorityFilter.includes(p)}
                        onChange={() => togglePriority(p)}
                        className="size-3.5 accent-primary"
                      />
                      <span className="capitalize">{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Assignee</p>
                <div className="space-y-0.5 max-h-[160px] overflow-y-auto">
                  <label
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm cursor-pointer transition-colors",
                      !assigneeFilter ? "bg-primary/10 text-foreground" : "hover:bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <input
                      type="radio"
                      name="assignee"
                      checked={!assigneeFilter}
                      onChange={() => setAssigneeFilter(null)}
                      className="size-3.5 accent-primary"
                    />
                    All
                  </label>
                  {users.map((u) => (
                    <label
                      key={u.id}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm cursor-pointer transition-colors",
                        assigneeFilter === u.id ? "bg-primary/10 text-foreground" : "hover:bg-muted/50 text-muted-foreground"
                      )}
                    >
                      <input
                        type="radio"
                        name="assignee"
                        checked={assigneeFilter === u.id}
                        onChange={() => setAssigneeFilter(u.id)}
                        className="size-3.5 accent-primary"
                      />
                      {u.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs gap-1 text-muted-foreground"
            onClick={clearFilters}
          >
            <X className="size-3.5" />
            Clear
          </Button>
        )}

        <Badge variant="outline" className="text-xs ml-auto">
          {filteredCount} / {totalCount} tasks
        </Badge>
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
