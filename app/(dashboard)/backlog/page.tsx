import { BacklogPage } from "@/features/dashboard/components/backlog/backlog-page";
import { requirePermission } from "@/lib/auth-guard";

export default async function Backlog() {
  await requirePermission("backlog");
  return <BacklogPage />;
}
