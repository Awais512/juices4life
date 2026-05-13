import { create } from "zustand";
import type { TaskItem, TaskStatus, Comment } from "@/types";
import { createTaskAction, updateTaskStatusAction, updateTaskAction, deleteTaskAction, addCommentAction, fetchTasksWithData } from "@/features/auth/actions/task-actions";
import { listEmployees } from "@/features/auth/actions/invite-actions";

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
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  updateTask: (taskId: string, updates: Partial<TaskItem>) => void;
  removeTask: (taskId: string) => void;
  addComment: (taskId: string, content: string, authorId: string, parentId?: string) => void;
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

  moveTask: (taskId, newStatus) => {
    updateTaskStatusAction(taskId, newStatus);
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus, updatedAt: new Date() }
          : t
      ),
    }));
  },

  updateTask: (taskId, updates) => {
    const { title, description, priority, assigneeId, dueDate, tags } = updates as any;
    updateTaskAction(taskId, { title, description, priority, assigneeId, dueDate, tags });
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
  },

  removeTask: (taskId) => {
    deleteTaskAction(taskId);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
      comments: state.comments.filter((c) => c.taskId !== taskId),
    }));
  },

  addComment: (taskId, content, authorId, parentId) => {
    addCommentAction(taskId, content, parentId);
    set((state) => ({
      comments: [
        ...state.comments,
        {
          id: `c${Date.now()}`,
          taskId,
          authorId,
          parentId: parentId ?? null,
          content,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    }));
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
