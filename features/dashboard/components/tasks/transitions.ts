import type { TaskStatus } from "@/types";

export const TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  "todo": ["in-progress"],
  "in-progress": ["review", "todo"],
  "review": ["done", "in-progress", "todo"],
  "done": [],
};

export interface TransitionDef {
  label: string;
  icon: string;
}

export const TRANSITION_LABELS: Record<string, TransitionDef> = {
  "todo->in-progress": { label: "Start Progress", icon: "Play" },
  "in-progress->review": { label: "Submit for Review", icon: "Eye" },
  "in-progress->todo": { label: "Move Back to To Do", icon: "ArrowLeft" },
  "review->done": { label: "Approve", icon: "CheckCheck" },
  "review->in-progress": { label: "Send Back", icon: "ArrowLeft" },
  "review->todo": { label: "Send to Backlog", icon: "ArrowLeft" },
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
