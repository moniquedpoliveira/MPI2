import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { QueryProvider } from "@/providers/query-provider";
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Lícito - Sistema de Gestão de Contratos Públicos",
  description: "Sistema para gerenciamento de contratos públicos brasileiros",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <AppSidebar />
          <div className="flex-1 ml-64 w-full overflow-hidden">
            <main className="h-full overflow-auto bg-background">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>

      <Toaster />
    </>
  );
}
