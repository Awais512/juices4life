import type { TaskStatus } from "@/types";

export const TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  "backlog": ["todo"],
  "todo": ["in-progress", "backlog"],
  "in-progress": ["review", "todo", "backlog"],
  "review": ["done", "in-progress", "todo", "backlog"],
  "done": [],
};

export interface TransitionDef {
  label: string;
  icon: string;
}

export const TRANSITION_LABELS: Record<string, TransitionDef> = {
  "backlog->todo": { label: "Move to Board", icon: "ArrowRight" },
  "todo->in-progress": { label: "Start Progress", icon: "Play" },
  "todo->backlog": { label: "Move to Backlog", icon: "Archive" },
  "in-progress->review": { label: "Submit for Review", icon: "Eye" },
  "in-progress->todo": { label: "Move Back to To Do", icon: "ArrowLeft" },
  "in-progress->backlog": { label: "Move to Backlog", icon: "Archive" },
  "review->done": { label: "Approve", icon: "CheckCheck" },
  "review->in-progress": { label: "Send Back", icon: "ArrowLeft" },
  "review->todo": { label: "Send to To Do", icon: "ArrowLeft" },
  "review->backlog": { label: "Move to Backlog", icon: "Archive" },
};

export function getValidTransitions(status: TaskStatus): TaskStatus[] {
  return TRANSITIONS[status] ?? [];
}

export function getTransitionLabel(from: TaskStatus, to: TaskStatus): string {
  return TRANSITION_LABELS[`${from}->${to}`]?.label ?? `Move to ${to}`;
}

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}
