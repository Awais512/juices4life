import { create } from "zustand";
import { MOCK_TASKS, MOCK_COMMENTS, MOCK_CURRENT_USER } from "@/lib/mock-data";
import type { TaskItem, TaskStatus, Comment } from "@/types";

interface TaskState {
  tasks: TaskItem[];
  comments: Comment[];
  addTask: (task: TaskItem) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  updateTask: (taskId: string, updates: Partial<TaskItem>) => void;
  addComment: (taskId: string, content: string, parentId?: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [...MOCK_TASKS],
  comments: [...MOCK_COMMENTS],

  addTask: (task) =>
    set((state) => ({ tasks: [...state.tasks, task] })),

  moveTask: (taskId, newStatus) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus, updatedAt: new Date() }
          : t
      ),
    })),

  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates, updatedAt: new Date() } : t
      ),
    })),

  addComment: (taskId, content, parentId) =>
    set((state) => ({
      comments: [
        ...state.comments,
        {
          id: `c${Date.now()}`,
          taskId,
          authorId: MOCK_CURRENT_USER.id,
          parentId: parentId ?? null,
          content,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })),
}));

// Selectors
export function getBoardTasks(tasks: TaskItem[]): TaskItem[] {
  return tasks.filter((t) => t.status !== "backlog");
}

export function getBacklogTasks(tasks: TaskItem[]): TaskItem[] {
  return tasks.filter((t) => t.status === "backlog");
}

export function getTasksByStatus(tasks: TaskItem[], status: TaskStatus): TaskItem[] {
  return tasks.filter((t) => t.status === status);
}

export function getTaskComments(comments: Comment[], taskId: string): Comment[] {
  return comments.filter((c) => c.taskId === taskId);
}

export function getKanbanColumns(tasks: TaskItem[]) {
  const statuses: { id: TaskStatus; title: string }[] = [
    { id: "todo", title: "To Do" },
    { id: "in-progress", title: "In Progress" },
    { id: "review", title: "Review" },
    { id: "done", title: "Done" },
  ];

  return statuses.map((s) => ({
    id: s.id,
    title: s.title,
    tasks: tasks
      .filter((t) => t.status === s.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  }));
}
