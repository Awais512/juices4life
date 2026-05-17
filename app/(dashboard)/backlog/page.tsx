import { BacklogPage } from "@/features/dashboard/components/backlog/backlog-page";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Backlog() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") return <BacklogPage />;

  const { data: perm } = await supabase
    .from("user_permissions")
    .select("id")
    .eq("user_id", user.id)
    .eq("resource", "backlog")
    .eq("action", "read")
    .maybeSingle();

  if (!perm) redirect("/");

  return <BacklogPage />;
}
