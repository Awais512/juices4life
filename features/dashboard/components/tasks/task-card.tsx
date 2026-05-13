"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useTaskStore, getUserById } from "@/lib/store/task-store";
import { getPriorityColor } from "@/lib/mock-data";
import { useCan } from "@/features/auth/utils/use-can";
import type { TaskItem, TaskStatus, TaskPriority } from "@/types";
import {
  Calendar,
  User,
  Tag,
  Play,
  CheckCheck,
  ArrowLeft,
  Eye,
  ArrowRight,
  Archive,
  X,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getValidTransitions,
  getTransitionLabel,
} from "./transitions";
import { TaskComments } from "./task-comments";

interface TaskCardProps {
  task: TaskItem;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const statusMeta: Record<TaskStatus, { dot: string; label: string }> = {
  "backlog": { dot: "bg-violet-500/50", label: "Backlog" },
  "todo": { dot: "bg-muted-foreground", label: "To Do" },
  "in-progress": { dot: "bg-primary", label: "In Progress" },
  "review": { dot: "bg-violet-500", label: "Review" },
  "done": { dot: "bg-emerald-500", label: "Done" },
};

const transitionIcons: Record<string, React.ReactNode> = {
  "backlog->todo": <ArrowRight className="size-3.5" />,
  "todo->in-progress": <Play className="size-3.5" />,
  "todo->backlog": <Archive className="size-3.5" />,
  "in-progress->review": <Eye className="size-3.5" />,
  "in-progress->todo": <ArrowLeft className="size-3.5" />,
  "in-progress->backlog": <Archive className="size-3.5" />,
  "review->done": <CheckCheck className="size-3.5" />,
  "review->in-progress": <ArrowLeft className="size-3.5" />,
  "review->todo": <ArrowLeft className="size-3.5" />,
  "review->backlog": <Archive className="size-3.5" />,
};

function getPrimaryTransition(from: TaskStatus): TaskStatus | null {
  if (from === "backlog") return "todo";
  if (from === "todo") return "in-progress";
  if (from === "in-progress") return "review";
  if (from === "review") return "done";
  return null;
}

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const users = useTaskStore((s) => s.users);
  const updateTask = useTaskStore((s) => s.updateTask);
  const removeTask = useTaskStore((s) => s.removeTask);

  const assignee = getUserById(users, task.assigneeId);
  const meta = statusMeta[task.status];
  const transitions = getValidTransitions(task.status);
  const primaryNext = getPrimaryTransition(task.status);

  const canUpdate = useCan("update", "tasks");
  const canDelete = useCan("delete", "tasks");
  const canEdit = canUpdate || canDelete;

  function toDateInput(d: Date | string | null | undefined): string {
    if (!d) return "";
    if (typeof d === "string") return d.slice(0, 10);
    return d.toISOString().split("T")[0];
  }

  const [form, setForm] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    assigneeId: task.assigneeId,
    dueDate: toDateInput(task.dueDate),
    tags: [...task.tags],
  });

  function startEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      assigneeId: task.assigneeId,
      dueDate: toDateInput(task.dueDate),
      tags: [...task.tags],
    });
    setEditing(true);
    setDeleteConfirm(false);
  }

  function handleSave() {
    updateTask(task.id, { ...form, dueDate: form.dueDate || null } as any);
    setEditing(false);
  }

  function handleDelete() {
    removeTask(task.id);
    setOpen(false);
    setDeleteConfirm(false);
  }

  function addTag() {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !form.tags.includes(trimmed)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  }

  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ id: task.id, fromStatus: task.status })
    );
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
          onClick={() => { setOpen(true); setEditing(false); setDeleteConfirm(false); }}
        >
          <CardContent className="p-3 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn("size-2 rounded-full shrink-0 mt-1.5", meta.dot)} />
                <h4 className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                  {task.title}
                </h4>
              </div>
              {canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 -mr-1 -mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[120px]">
                    {canUpdate && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen(true);
                          startEdit(e as any);
                        }}
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen(true);
                          setDeleteConfirm(true);
                        }}
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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
              <div className="flex items-center gap-1">
                {canUpdate && primaryNext && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(task.id, primaryNext);
                        }}
                      >
                        {transitionIcons[`${task.status}->${primaryNext}`] ?? (
                          <ArrowLeft className="size-3.5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {getTransitionLabel(task.status, primaryNext)}
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
                  <TooltipContent side="top" className="text-xs">
                    {assignee?.name ?? "Unassigned"}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog
          open={open}
          onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(false); setDeleteConfirm(false); } }}
        >
          <DialogContent className="sm:max-w-lg border-border/50 bg-card">
            <DialogHeader className="shrink-0">
              <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                <div className={cn("size-2.5 rounded-full shrink-0", meta.dot)} />
                <span>{task.title}</span>
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground pt-1">
                Created {task.createdAt.toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto max-h-[65vh] px-1">
              {deleteConfirm ? (
                <div className="py-6 space-y-4">
                  <p className="text-sm text-foreground text-center">
                    Delete &ldquo;{task.title}&rdquo;? This action cannot be undone.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete
                    </Button>
                  </div>
                </div>
              ) : editing ? (
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title" className="text-sm font-medium">Title</Label>
                    <Input
                      id="edit-title"
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-desc" className="text-sm font-medium">Description</Label>
                    <Textarea
                      id="edit-desc"
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      className="min-h-[80px] resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Priority</Label>
                      <Select
                        value={form.priority}
                        onValueChange={(v) => setForm((p) => ({ ...p, priority: v as TaskPriority }))}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Assignee</Label>
                      <Select
                        value={form.assigneeId}
                        onValueChange={(v) => setForm((p) => ({ ...p, assigneeId: v }))}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Due date</Label>
                    <Input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                        placeholder="Add tag..."
                        className="h-10 flex-1"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addTag} className="h-10">
                        <Plus className="size-4" />
                      </Button>
                    </div>
                    {form.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {form.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs gap-1 px-2 py-0.5">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-foreground">
                              <X className="size-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                    <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 py-2">
                  <p className="text-sm text-foreground leading-relaxed">{task.description}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                        <User className="size-3" /> Assignee
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
                        <Tag className="size-3" /> Priority
                      </span>
                      <Badge className={cn("text-xs px-2 py-0.5 font-medium", getPriorityColor(task.priority))}>
                        {task.priority}
                      </Badge>
                    </div>
                    {task.dueDate && (
                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                          <Calendar className="size-3" /> Due date
                        </span>
                        <span className="text-sm text-foreground">
                          {task.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    )}
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">Status</span>
                      <div className="flex items-center gap-2">
                        <div className={cn("size-2 rounded-full", meta.dot)} />
                        <span className="text-sm text-foreground">{meta.label}</span>
                      </div>
                    </div>
                  </div>

                  {canUpdate && transitions.length > 0 && (
                    <div className="space-y-2 pt-1 border-t border-border/50">
                      <span className="text-xs text-muted-foreground font-medium">Workflow Actions</span>
                      <div className="flex flex-wrap gap-2">
                        {transitions.map((nextStatus) => {
                          const nextMeta = statusMeta[nextStatus];
                          return (
                            <Button
                              key={nextStatus}
                              variant="outline"
                              size="sm"
                              className="gap-1.5 h-8 text-sm border-border/50"
                              onClick={() => { onStatusChange(task.id, nextStatus); setOpen(false); }}
                            >
                              {transitionIcons[`${task.status}->${nextStatus}`]}
                              <span>{getTransitionLabel(task.status, nextStatus)}</span>
                              <div className={cn("size-1.5 rounded-full", nextMeta.dot)} />
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {task.tags.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground font-medium">Tags</span>
                      <div className="flex flex-wrap gap-1.5">
                        {task.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs capitalize">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <TaskComments taskId={task.id} />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    </TooltipProvider>
  );
}
