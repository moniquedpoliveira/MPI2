import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { useState } from "react";

interface ClarificationCardProps {
  esc: any;
  formatDate: (date: Date | string) => string;
}

export function ClarificationCard({ esc, formatDate }: ClarificationCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="shadow-none border border-neutral-200">
      <CardContent className="p-3 space-y-4">
        {/* Pergunta */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold text-neutral-800">
              Pergunta
            </span>
          </div>
          <p className="text-sm text-neutral-700 pl-5 mb-1">{esc.question}</p>
          <div className="flex items-center justify-between pl-5 text-xs text-neutral-400">
            <span>
              Solicitado por: {esc.askedBy?.name || esc.askedBy?.email}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(esc.askedAt)}
            </span>
          </div>
        </div>

        {/* Resposta (Collapsible) */}
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-xs text-blue-700 font-medium hover:underline pl-1 focus:outline-none">
            {open ? (
              <>
                <ChevronUp className="w-4 h-4" /> Ocultar resposta
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" /> Ver resposta
              </>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            {esc.answer ? (
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold text-neutral-800">
                    Resposta
                  </span>
                </div>
                <p className="text-sm text-neutral-700 pl-5 mb-1">
                  {esc.answer}
                </p>
                <div className="flex items-center justify-between pl-5 text-xs text-neutral-400">
                  <span>
                    Respondido por:{" "}
                    {esc.answeredBy?.name || esc.answeredBy?.email}
                  </span>
                  {esc.answeredAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(esc.answeredAt)}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-2 mt-3">
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  Aguardando resposta
                </Badge>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
