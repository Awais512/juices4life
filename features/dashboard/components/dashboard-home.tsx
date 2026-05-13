"use client";

import { useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ListTodo,
  PlayCircle,
  CheckCircle2,
  Users,
  Clock,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPriorityColor } from "@/lib/mock-data";
import { getDashboardStats } from "../utils/dashboard-utils";
import { useTaskStore, getBoardTasks, getUserById } from "@/lib/store/task-store";
import { DashboardCharts } from "./dashboard-charts";

export function DashboardHome() {
  const tasks = useTaskStore((s) => s.tasks);
  const users = useTaskStore((s) => s.users);
  const loaded = useTaskStore((s) => s.loaded);
  const loading = useTaskStore((s) => s.loading);
  const loadData = useTaskStore((s) => s.loadData);

  useEffect(() => {
    if (!loaded && !loading) {
      loadData();
    }
  }, [loaded, loading, loadData]);

  const boardTasks = useMemo(() => getBoardTasks(tasks), [tasks]);
  const employeeCount = useMemo(
    () => users.length,
    [users]
  );
  const stats = useMemo(
    () => getDashboardStats(boardTasks, employeeCount),
    [boardTasks, employeeCount]
  );

  const statCards = [
    {
      label: "Total Tasks",
      value: stats.totalTasks,
      icon: ListTodo,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "In Progress",
      value: stats.tasksInProgress,
      icon: PlayCircle,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Completed",
      value: stats.tasksDone,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Employees",
      value: stats.totalEmployees,
      icon: Users,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
  ];

  const recentTasks = useMemo(
    () =>
      [...boardTasks]
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 5),
    [boardTasks]
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your workspace activity
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.label}
              className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200"
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div
                  className={cn(
                    "size-11 rounded-xl flex items-center justify-center shrink-0",
                    card.bg
                  )}
                >
                  <Icon className={cn("size-5", card.color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-0.5 tabular-nums">
                    {card.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DashboardCharts />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                Recent Tasks
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentTasks.map((task) => {
                const assignee = getUserById(users, task.assigneeId);
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={cn(
                        "size-2 rounded-full shrink-0",
                        task.status === "todo" && "bg-muted-foreground",
                        task.status === "in-progress" && "bg-primary",
                        task.status === "review" && "bg-violet-500",
                        task.status === "done" && "bg-emerald-500"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {assignee?.name ?? "Unassigned"}
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        "text-[10px] px-2 py-0.5 font-medium",
                        getPriorityColor(task.priority)
                      )}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Team Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/30 p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Total Users</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{stats.totalEmployees}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Employees</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
