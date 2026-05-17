import { PermissionsList } from "@/features/dashboard/components/permissions/permissions-list";
import { listEmployees } from "@/features/auth/actions/invite-actions";
import { requirePermission } from "@/lib/auth-guard";

export default async function PermissionsPage() {
  await requirePermission("admin");
  const employees = await listEmployees();
  return <PermissionsList initialUsers={employees} />;
}
