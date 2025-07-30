"use client";

import {
  Bot,
  Calendar,
  FileText,
  Home,
  Loader2,
  LogOut,
  MessageSquare,
  Plus,
} from "lucide-react"; // Added MessageSquare
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
import { useChats, useGenerateChatTitle } from "@/hooks/use-chats";
import { IconPlus } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { LogoutButton } from "./logout-button";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Contratos",
    url: "/contratos",
    icon: FileText,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: chats, isLoading: isLoadingChats } = useChats();

  const formatChatTitle = (chat: any) => {
    if (chat.title) return chat.title;
    if (chat.messages.length > 0)
      return `${chat.messages[0].content?.slice(0, 50)}...` || "New Chat";
    return "Nova Conversa";
  };

  return (
    <Sidebar
      collapsible="none"
      className="bg-zinc-900 h-screen text-white fixed left-0 top-0 z-50"
    >
      <SidebarHeader className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-blue-400" />
          <span className="font-bold text-lg text-white">Lícito</span>
        </div>
        <p className="text-sm text-gray-400">Gestão de Contratos Públicos</p>
      </SidebarHeader>

      <SidebarContent className="no-scrollbar">
        <div className="p-4">
          <Link href="/contratos/novo" className="">
            <Button className="w-full flex items-center gap-2 cursor-pointer bg-primary hover:bg-primary/80 text-white">
              <IconPlus className="h-4 w-4" />
              Adicionar Novo Contrato
            </Button>
          </Link>
        </div>

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

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-gray-400">
            Conversas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href="/chatbot"
                    className="flex items-center gap-2 !text-gray-300 hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Nova Conversa</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isLoadingChats ? (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled className="text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Carregando conversas...</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                chats?.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/chatbot/${chat.id}`}
                    >
                      <Link
                        href={`/chatbot/${chat.id}`}
                        className="!text-gray-300 hover:text-white"
                      >
                        <span className="truncate">
                          {formatChatTitle(chat)}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
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
