import { useUser } from "@/features/auth/components/user-provider";
import type { PermissionAction, ResourceType } from "@/types";

export function useCan(action: PermissionAction, resource: ResourceType = "tasks"): boolean {
  const user = useUser();
  if (!user) return false;
  if (user.role === "admin") return true;
  return user.permissions[resource]?.includes(action) ?? false;
}
