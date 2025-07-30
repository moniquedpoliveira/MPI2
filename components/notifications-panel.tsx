"use client";

import { useEffect, useState } from "react";
import {
  getUserNotifications,
  markNotificationAsRead,
} from "@/actions/fiscais";
import { useSession } from "next-auth/react";
import { Bell, CheckCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/use-notifications";

export function NotificationsPanel() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { notifications, isLoading, refetch, markAsRead } =
    useNotifications(userId);

  // Refetch notifications only when popover is opened
  useEffect(() => {
    if (open && userId) {
      refetch();
    }
  }, [open, userId, refetch]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  // Helper to build esclarecimento URL
  const getEsclarecimentoUrl = (notif: any) => {
    const checklistItem = notif.esclarecimento?.checklistItem;
    if (!checklistItem) return undefined;
    const contratoId =
      checklistItem.contratoId ||
      checklistItem.contrato_id ||
      checklistItem.contrato_id;
    const checklistTipo = checklistItem.checklist?.type?.toLowerCase();
    const tipo = checklistTipo === "tecnica" ? "tecnico" : "administrativo";
    return `/contratos/${contratoId}`;
  };

  const unreadCount = notifications.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative bg-zinc-900 border-zinc-600 hover:bg-zinc-800 group"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1">
              <Badge
                variant="destructive"
                className="rounded-full px-1 text-xs group-hover:text-white"
              >
                {unreadCount}
              </Badge>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 max-h-96 overflow-y-auto p-0 bg-zinc-900 text-white border-zinc-800">
        <div className="p-4 border-b border-zinc-800 font-semibold text-base flex items-center gap-2 bg-zinc-900 text-white">
          <Bell className="h-4 w-4 text-blue-400" /> Notificações
        </div>
        {isLoading ? (
          <div className="p-4 text-center text-gray-400">Carregando...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            Nenhuma notificação
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {notifications.map((notif) => {
              const isEsclarecimento =
                notif.type === "ESCLARECIMENTO_RESPONDIDO" ||
                notif.type === "ESCLARECIMENTO_PEDIDO";
              const esclarecimentoUrl = isEsclarecimento
                ? getEsclarecimentoUrl(notif)
                : undefined;
              return (
                <li
                  key={notif.id}
                  className={`p-4 flex gap-3 items-start transition-colors duration-150 bg-zinc-800 hover:bg-zinc-700 cursor-pointer`}
                  onClick={() => {
                    if (esclarecimentoUrl) {
                      setOpen(false);
                      router.push(esclarecimentoUrl);
                    }
                  }}
                  style={isEsclarecimento ? { cursor: "pointer" } : {}}
                >
                  <div className="pt-1">
                    {notif.type === "ESCLARECIMENTO_RESPONDIDO" ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : notif.type === "ESCLARECIMENTO_PEDIDO" ? (
                      <MessageSquare className="h-5 w-5 text-yellow-400" />
                    ) : (
                      <Bell className="h-5 w-5 text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    {notif.type === "ESCLARECIMENTO_RESPONDIDO" &&
                    notif.esclarecimento ? (
                      <div>
                        <div className="font-medium text-white">
                          Esclarecimento respondido
                        </div>
                        <div className="text-sm text-gray-400">
                          Sua pergunta sobre{" "}
                          <b>
                            {notif.esclarecimento.checklistItem?.checklist
                              ?.text || "item do checklist"}
                          </b>{" "}
                          foi respondida.
                        </div>
                        <div className="mt-1 text-xs text-gray-300">
                          Resposta: {notif.esclarecimento.answer}
                        </div>
                      </div>
                    ) : notif.type === "ESCLARECIMENTO_PEDIDO" &&
                      notif.esclarecimento ? (
                      <div>
                        <div className="font-medium text-white">
                          Novo pedido de esclarecimento
                        </div>
                        <div className="text-sm text-gray-400">
                          Pergunta sobre{" "}
                          <b>
                            {notif.esclarecimento.checklistItem?.checklist
                              ?.text || "item do checklist"}
                          </b>
                          :
                        </div>
                        <div className="mt-1 text-xs text-gray-300">
                          {notif.esclarecimento.question}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-white">
                          Notificação
                        </div>
                        <div className="text-sm text-gray-400">
                          {notif.type}
                        </div>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      {new Date(notif.createdAt).toLocaleString("pt-BR")}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-2 border-zinc-700 text-gray-300 hover:bg-zinc-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notif.id);
                    }}
                  >
                    Marcar como lida
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
