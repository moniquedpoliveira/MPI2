import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ObservationCardProps {
  obs: any;
  getStatusBadge: (status: string) => React.ReactNode;
  formatDate: (date: Date | string) => string;
}

export function ObservationCard({
  obs,
  getStatusBadge,
  formatDate,
}: ObservationCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">
              {obs.user?.name || obs.user?.email}
            </span>
            {getStatusBadge(obs.status)}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {formatDate(obs.createdAt)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm">{obs.observation}</p>
      </CardContent>
    </Card>
  );
}
