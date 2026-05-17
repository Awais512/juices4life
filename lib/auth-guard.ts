"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type ProtectedResource = "tasks" | "backlog" | "employees" | "permissions";

export async function requirePermission(resource: ProtectedResource | "admin") {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") return;

  if (resource === "admin") redirect("/");

  const { data: perm } = await supabase
    .from("user_permissions")
    .select("id")
    .eq("user_id", user.id)
    .eq("resource", resource)
    .eq("action", "read")
    .maybeSingle();

  if (!perm) redirect("/");
}
