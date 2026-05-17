import { listEmployees } from "@/features/auth/actions/invite-actions";
import { EmployeesTable } from "@/features/dashboard/components/employees/employees-table";
import { requirePermission } from "@/lib/auth-guard";

export default async function EmployeesPage() {
  await requirePermission("employees");
  const employees = await listEmployees();
  return <EmployeesTable initialEmployees={employees} />;
}
