import type { ResourceType, PermissionAction, PermissionMap } from "@/types";

export const ALL_RESOURCES: ResourceType[] = ["tasks", "backlog", "employees", "permissions"];
export const ALL_ACTIONS: PermissionAction[] = ["create", "read", "update", "delete"];

export function buildPermissionMap(
  rows: { resource: string; action: string }[]
): PermissionMap {
  const map = {} as PermissionMap;
  for (const resource of ALL_RESOURCES) {
    map[resource] = [];
  }
  for (const row of rows) {
    const r = row.resource as ResourceType;
    const a = row.action as PermissionAction;
    if (ALL_RESOURCES.includes(r) && ALL_ACTIONS.includes(a)) {
      map[r].push(a);
    }
  }
  return map;
}

export function flattenPermissionMap(
  userId: string,
  map: PermissionMap
): { user_id: string; resource: string; action: string }[] {
  const rows: { user_id: string; resource: string; action: string }[] = [];
  for (const [resource, actions] of Object.entries(map)) {
    for (const action of actions) {
      rows.push({ user_id: userId, resource, action });
    }
  }
  return rows;
}

export function defaultPermissions(): PermissionMap {
  return { tasks: ["read"], backlog: [], employees: [], permissions: [] };
}

export function adminPermissions(): PermissionMap {
  const map = {} as PermissionMap;
  for (const resource of ALL_RESOURCES) {
    map[resource] = [...ALL_ACTIONS];
  }
  return map;
}

export function resourceLabels(resource: ResourceType): string {
  const labels: Record<ResourceType, string> = {
    tasks: "Tasks",
    backlog: "Backlog",
    employees: "Employees",
    permissions: "Permissions",
  };
  return labels[resource];
}
