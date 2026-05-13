"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function fetchTasksWithData() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { tasks: [], comments: [] };

  const admin = createAdminClient();

  const { data: tasks } = await admin
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: comments } = await admin
    .from("task_comments")
    .select("*")
    .order("created_at", { ascending: true });

  return {
    tasks:
      tasks?.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        assigneeId: t.assignee_id,
        createdBy: t.created_by,
        createdAt: new Date(t.created_at),
        updatedAt: new Date(t.updated_at),
        dueDate: t.due_date ? new Date(t.due_date) : null,
        tags: t.tags || [],
      })) || [],
    comments:
      comments?.map((c: any) => ({
        id: c.id,
        taskId: c.task_id,
        authorId: c.author_id,
        parentId: c.parent_id,
        content: c.content,
        createdAt: new Date(c.created_at),
        updatedAt: new Date(c.updated_at),
      })) || [],
  };
}

export async function createTaskAction(data: {
  title: string;
  description: string;
  priority: string;
  assigneeId: string;
  dueDate: string | null;
  tags: string[];
  status: string;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: "Unauthorized" };

  const admin = createAdminClient();

  const { data: task, error } = await admin
    .from("tasks")
    .insert({
      title: data.title,
      description: data.description,
      priority: data.priority,
      assignee_id: data.assigneeId || null,
      created_by: user.id,
      due_date: data.dueDate || null,
      tags: data.tags,
      status: data.status,
    })
    .select()
    .single();

  if (error) {
    return { success: false as const, error: "Failed to create task" };
  }

  return {
    success: true as const,
    data: {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assignee_id,
      createdBy: task.created_by,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
      dueDate: task.due_date ? new Date(task.due_date) : null,
      tags: task.tags || [],
    },
  };
}

export async function updateTaskStatusAction(taskId: string, newStatus: string) {
  const admin = createAdminClient();

  const { error } = await admin
    .from("tasks")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) {
    return { success: false as const, error: "Failed to update task" };
  }

  return { success: true as const };
}

export async function updateTaskAction(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    priority?: string;
    assigneeId?: string | null;
    dueDate?: string | null;
    tags?: string[];
  }
) {
  const admin = createAdminClient();

  const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.assigneeId !== undefined) updateData.assignee_id = data.assigneeId || null;
  if (data.dueDate !== undefined) updateData.due_date = data.dueDate || null;
  if (data.tags !== undefined) updateData.tags = data.tags;

  const { error } = await admin.from("tasks").update(updateData).eq("id", taskId);

  if (error) {
    return { success: false as const, error: "Failed to update task" };
  }

  return { success: true as const };
}

export async function deleteTaskAction(taskId: string) {
  const admin = createAdminClient();

  const { error } = await admin.from("tasks").delete().eq("id", taskId);

  if (error) {
    return { success: false as const, error: "Failed to delete task" };
  }

  return { success: true as const };
}

export async function addCommentAction(
  taskId: string,
  content: string,
  parentId?: string
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: "Unauthorized" };

  const admin = createAdminClient();

  const { data: comment, error } = await admin
    .from("task_comments")
    .insert({
      task_id: taskId,
      author_id: user.id,
      content,
      parent_id: parentId || null,
    })
    .select()
    .single();

  if (error) {
    return { success: false as const, error: "Failed to add comment" };
  }

  return {
    success: true as const,
    data: {
      id: comment.id,
      taskId: comment.task_id,
      authorId: comment.author_id,
      parentId: comment.parent_id,
      content: comment.content,
      createdAt: new Date(comment.created_at),
      updatedAt: new Date(comment.updated_at),
    },
  };
}
