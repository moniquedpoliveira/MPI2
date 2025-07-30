import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Edit,
  Plus,
  MessageCircle,
  MessageSquare,
} from "lucide-react";
import type { ChecklistItemStatus, ChecklistType } from "@prisma/client";

interface ChecklistItemWithRelations {
  id: string;
  contratoId: string;
  checklistId: string;
  status: ChecklistItemStatus;
  currentObservation: string | null;
  createdAt: Date;
  updatedAt: Date;
  checklist: {
    id: string;
    text: string;
    type: ChecklistType;
    createdAt: Date;
  };
  observationHistory: Array<{
    id: string;
    status: ChecklistItemStatus;
    observation: string;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
  esclarecimentos: Array<{
    id: string;
    question: string;
    answer: string | null;
    askedAt: Date;
    answeredAt: Date | null;
    askedBy: {
      id: string;
      name: string | null;
      email: string;
    };
    answeredBy: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  }>;
}

interface ChecklistTableProps {
  checklistItems: ChecklistItemWithRelations[];
  getStatusBadgeForItem: (status: ChecklistItemStatus) => React.ReactNode;
  getPendingClarifications: (item: ChecklistItemWithRelations) => any[];
  isFiscalAdministrativo: boolean;
  isFiscalTecnico: boolean;
  isOrdenador: boolean;
  onStatusDialogOpen: (item: ChecklistItemWithRelations) => void;
  onObservationDialogOpen: (item: ChecklistItemWithRelations) => void;
  onClarificationDialogOpen: (item: ChecklistItemWithRelations) => void;
  onDetailDialogOpen: (item: ChecklistItemWithRelations) => void;
}

export function ChecklistTable({
  checklistItems,
  getStatusBadgeForItem,
  getPendingClarifications,
  isFiscalAdministrativo,
  isFiscalTecnico,
  isOrdenador,
  onStatusDialogOpen,
  onObservationDialogOpen,
  onClarificationDialogOpen,
  onDetailDialogOpen,
}: ChecklistTableProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Observações</TableHead>
            <TableHead>Esclarecimentos Pendentes</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {checklistItems.map((item) => {
            const pendingClarifications = getPendingClarifications(item);
            return (
              <TableRow
                key={item.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onDetailDialogOpen(item)}
              >
                <TableCell className="font-medium">
                  {item.checklist.text}
                </TableCell>
                <TableCell>{getStatusBadgeForItem(item.status)}</TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {item.observationHistory.length} observação(ões)
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {pendingClarifications.length} pendente(s)
                  </span>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {(isFiscalAdministrativo || isFiscalTecnico) && (
                        <>
                          <DropdownMenuItem
                            onClick={() => onStatusDialogOpen(item)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Mudar Status
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onObservationDialogOpen(item)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Observação
                          </DropdownMenuItem>
                          {pendingClarifications.length > 0 && (
                            <DropdownMenuItem
                              onClick={() => onClarificationDialogOpen(item)}
                            >
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Responder Esclarecimentos
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                      {isOrdenador && (
                        <DropdownMenuItem
                          onClick={() => onClarificationDialogOpen(item)}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Solicitar Esclarecimento
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
