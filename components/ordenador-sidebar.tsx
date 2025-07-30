"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LogoutButton } from "./logout-button";
import { NotificationsPanel } from "./notifications-panel";

const menuItems = [
  {
    title: "Contratos",
    url: "/",
    icon: FileText,
  },
];

export function OrdenadorSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="none"
      className="bg-zinc-900 h-screen text-white fixed left-0 top-0 z-50"
    >
      <SidebarHeader className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-400" />
            <span className="font-bold text-lg text-white">Lícito</span>
          </div>
          <NotificationsPanel />
        </div>
        <p className="text-sm text-gray-400">Ordenador de Despesas</p>
      </SidebarHeader>

      <SidebarContent className="no-scrollbar">
        <SidebarGroup className="pt-0">
          <SidebarGroupLabel className="text-gray-400">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link
                      href={item.url}
                      className="!text-gray-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-4">
        <div className="space-y-4">
          <LogoutButton />
          <div className="text-xs text-gray-400">
            Sistema de Gestão de Contratos v1.0
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
