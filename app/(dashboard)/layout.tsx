import { Sidebar } from "@/features/dashboard/components/sidebar";
import { SidebarProvider } from "@/features/dashboard/components/sidebar-context";
import { DashboardContent } from "@/features/dashboard/components/dashboard-content";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </SidebarProvider>
  );
}
