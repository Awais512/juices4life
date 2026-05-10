import { Sidebar } from "@/features/dashboard/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto p-6 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
