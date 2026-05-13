import { listEmployees } from "@/features/auth/actions/invite-actions";
import { EmployeesTable } from "@/features/dashboard/components/employees/employees-table";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function EmployeesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/");

  const employees = await listEmployees();
  return <EmployeesTable initialEmployees={employees} />;
}
