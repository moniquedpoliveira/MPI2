import { NotificationsPanel } from "@/components/notifications-panel";
import { OrdenadorSidebar } from "@/components/ordenador-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryProvider } from "@/providers/query-provider";
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Lícito - Ordenador de Despesas",
  description:
    "Painel do ordenador de despesas do sistema de gestão de contratos",
};

export default function OrdenadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <QueryProvider>
        <SidebarProvider>
          <div className="flex h-screen w-full overflow-hidden">
            <OrdenadorSidebar />
            <div className="flex-1 ml-64 w-full overflow-hidden ">
              <div className="flex justify-end items-center py-2 px-6 border-b border-gray-200 ">
                <NotificationsPanel />
              </div>
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
