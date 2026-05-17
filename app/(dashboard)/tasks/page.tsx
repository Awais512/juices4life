import { KanbanBoard } from "@/features/dashboard/components/tasks/kanban-board";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function TasksPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") return <KanbanBoard />;

  const { data: perm } = await supabase
    .from("user_permissions")
    .select("id")
    .eq("user_id", user.id)
    .eq("resource", "tasks")
    .eq("action", "read")
    .maybeSingle();

  if (!perm) redirect("/");

  return <KanbanBoard />;
}
