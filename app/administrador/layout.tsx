import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryProvider } from "@/providers/query-provider";
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Lícito - Administração",
  description: "Painel administrativo do sistema de gestão de contratos",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <QueryProvider>
        <SidebarProvider>
          <div className="flex h-screen w-full overflow-hidden">
            <AdminSidebar />
            <div className="flex-1 ml-64 w-full overflow-hidden">
              <main className="h-full overflow-auto bg-background">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </QueryProvider>

      <Toaster />
    </>
  );
}
