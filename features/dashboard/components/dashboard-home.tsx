"use client";

import { cn } from "@/lib/utils";
import {
  ListTodo,
  PlayCircle,
  CheckCircle2,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_TASKS, MOCK_USERS, getMockUserById, getPriorityColor } from "@/lib/mock-data";
import { getDashboardStats } from "../utils/dashboard-utils";

const stats = getDashboardStats();

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
    color: "text-amber-400",
    bg: "bg-amber-500/10",
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

export function DashboardHome() {
  const recentTasks = [...MOCK_TASKS]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your workspace activity
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
                  </div>
                  <div className={cn("size-11 rounded-xl flex items-center justify-center", stat.bg)}>
                    <Icon className={cn("size-5", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                Recent Tasks
              </CardTitle>
              <Badge variant="outline" className="text-[11px]">
                Latest 5
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentTasks.map((task) => {
              const assignee = getMockUserById(task.assigneeId);
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className={cn(
                    "size-2 rounded-full shrink-0",
                    task.status === "todo" && "bg-muted-foreground",
                    task.status === "in-progress" && "bg-primary",
                    task.status === "done" && "bg-emerald-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {assignee?.name ?? "Unassigned"}
                    </p>
                  </div>
                  <Badge className={cn("text-[10px] px-2 py-0.5 font-medium", getPriorityColor(task.priority))}>
                    {task.priority}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="size-4 text-muted-foreground" />
                Task Distribution
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">To Do</span>
                  <span className="font-medium text-foreground">{stats.totalTasks - stats.tasksInProgress - stats.tasksDone}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-muted-foreground transition-all duration-500"
                    style={{
                      width: `${((stats.totalTasks - stats.tasksInProgress - stats.tasksDone) / stats.totalTasks) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">In Progress</span>
                  <span className="font-medium text-foreground">{stats.tasksInProgress}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{
                      width: `${(stats.tasksInProgress / stats.totalTasks) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Done</span>
                  <span className="font-medium text-foreground">{stats.tasksDone}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{
                      width: `${(stats.tasksDone / stats.totalTasks) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/30 p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{MOCK_USERS.length}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Total Users</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {MOCK_USERS.filter((u) => u.role === "admin").length}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">Admins</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {MOCK_USERS.filter((u) => u.isActive).length}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
