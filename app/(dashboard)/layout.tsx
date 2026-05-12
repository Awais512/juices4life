import { getCurrentUser } from "@/features/auth/actions/auth-actions";
import { redirect } from "next/navigation";
import { Sidebar } from "@/features/dashboard/components/sidebar";
import { SidebarProvider } from "@/features/dashboard/components/sidebar-context";
import { DashboardContent } from "@/features/dashboard/components/dashboard-content";
import { UserProvider } from "@/features/auth/components/user-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <UserProvider user={user}>
        <div className="min-h-screen bg-background">
          <Sidebar />
          <DashboardContent>{children}</DashboardContent>
        </div>
      </UserProvider>
    </SidebarProvider>
  );
}
