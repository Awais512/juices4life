"use client";

import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePoll } from "@/features/shared/hooks/use-poll";
import { useUserContext } from "@/features/auth/components/user-provider";
import { fetchCurrentPermissions } from "@/features/auth/actions/auth-actions";

export function usePermissionPoller() {
  const { user, setUser } = useUserContext();
  const pathname = usePathname();
  const router = useRouter();

  usePoll(fetchCurrentPermissions, {
    interval: 60000,
    enabled: !!user,
    onResult: (freshPermissions) => {
      if (!user) return;
      const current = JSON.stringify(user.permissions);
      const fresh = JSON.stringify(freshPermissions);
      if (current !== fresh) {
        const updatedUser = { ...user, permissions: freshPermissions };
        setUser(updatedUser);
        toast.info("Permissions updated");

        if (
          user.role !== "admin" &&
          (
            (pathname.startsWith("/tasks")     && !freshPermissions.tasks?.includes("read")) ||
            (pathname.startsWith("/backlog")   && !freshPermissions.backlog?.includes("read")) ||
            (pathname.startsWith("/employees") && !freshPermissions.employees?.includes("read")) ||
            pathname.startsWith("/permissions")
          )
        ) {
          router.push("/");
        }
      }
    },
  });
}

export function PermissionPoller() {
  usePermissionPoller();
  return null;
}
