import { listEmployees } from "@/features/auth/actions/invite-actions";
import { EmployeesTable } from "@/features/dashboard/components/employees/employees-table";

export default async function EmployeesPage() {
  const employees = await listEmployees();
  return <EmployeesTable initialEmployees={employees} />;
}
