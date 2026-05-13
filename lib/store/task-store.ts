import { create } from "zustand";
import type { TaskItem, TaskStatus, Comment } from "@/types";
import { createTaskAction, updateTaskStatusAction, updateTaskAction, deleteTaskAction, addCommentAction, fetchTasksWithData } from "@/features/auth/actions/task-actions";
import { listEmployees } from "@/features/auth/actions/invite-actions";
import { toast } from "sonner";

const STATUS_DISPLAY: Record<string, string> = {
  backlog: "Backlog",
  todo: "To Do",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
};

export type UserBrief = { id: string; name: string; avatar: string };

interface TaskState {
  tasks: TaskItem[];
  comments: Comment[];
  users: UserBrief[];
  loaded: boolean;
  loading: boolean;
  setData: (tasks: TaskItem[], comments: Comment[], users: UserBrief[]) => void;
  loadData: () => Promise<void>;
  addTask: (task: TaskItem) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<TaskItem>) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
  addComment: (taskId: string, content: string, authorId: string, parentId?: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  comments: [],
  users: [],
  loaded: false,
  loading: false,

  setData: (tasks, comments, users) =>
    set({ tasks, comments, users, loaded: true, loading: false }),

  loadData: async () => {
    set({ loading: true });
    const [tasksRes, usersRes] = await Promise.all([
      fetchTasksWithData(),
      listEmployees(),
    ]);
    set({
      tasks: tasksRes.tasks,
      comments: tasksRes.comments,
      users: usersRes.map((u: any) => ({ id: u.id, name: u.name, avatar: u.avatar })),
      loaded: true,
      loading: false,
    });
  },

  addTask: (task) =>
    set((state) => ({ tasks: [...state.tasks, task] })),

  moveTask: async (taskId, newStatus) => {
    const result = await updateTaskStatusAction(taskId, newStatus);
    if (result.success) {
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date() } : t
        ),
      }));
      toast.success(`Moved to ${STATUS_DISPLAY[newStatus] || newStatus}`);
    } else {
      toast.error(result.error || "Failed to move task");
    }
  },

  updateTask: async (taskId, updates) => {
    const { title, description, priority, assigneeId, dueDate, tags } = updates as any;
    const result = await updateTaskAction(taskId, { title, description, priority, assigneeId, dueDate, tags });
    if (result.success) {
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                ...updates,
                dueDate: dueDate ? (typeof dueDate === "string" ? new Date(dueDate) : dueDate) : null,
                updatedAt: new Date(),
              }
            : t
        ),
      }));
      toast.success("Task updated");
    } else {
      toast.error(result.error || "Failed to update task");
    }
  },

  removeTask: async (taskId) => {
    const result = await deleteTaskAction(taskId);
    if (result.success) {
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
        comments: state.comments.filter((c) => c.taskId !== taskId),
      }));
      toast.success("Task deleted");
    } else {
      toast.error(result.error || "Failed to delete task");
    }
  },

  addComment: async (taskId, content, authorId, parentId) => {
    const result = await addCommentAction(taskId, content, parentId);
    if (result.success && result.data) {
      set((state) => ({
        comments: [...state.comments, result.data as Comment],
      }));
    } else {
      toast.error(result.error || "Failed to add comment");
    }
  },
}));

export function getUserById(users: UserBrief[], id: string): UserBrief | undefined {
  return users.find((u) => u.id === id);
}

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
