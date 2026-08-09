import { Building2, CalendarClock, ExternalLink, MapPin, Pencil, Star, Trash2, Users } from 'lucide-react';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import {
  companyNameOf,
  isPastWorkshop,
  type FacilitatorWorkshop,
} from '@/presentation/pages/facilitador/mockWorkshops';

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

interface WorkshopCardProps {
  workshop: FacilitatorWorkshop;
  onEdit: (workshop: FacilitatorWorkshop) => void;
  onDelete: (workshop: FacilitatorWorkshop) => void;
}

export function WorkshopCard({ workshop, onEdit, onDelete }: WorkshopCardProps) {
  const past = isPastWorkshop(workshop);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Oficina #{workshop.id}</CardTitle>
        <CardAction>
          <Badge variant={past ? 'secondary' : 'default'}>{past ? 'Realizada' : 'Agendada'}</Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5 text-sm">
        <p className="flex items-center gap-2">
          <CalendarClock className="size-4 shrink-0 text-primary" />
          <span className="font-medium text-title">
            {formatDate(workshop.datetime)} às {formatTime(workshop.datetime)}
          </span>
        </p>

        <p className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="size-4 shrink-0" />
          <span className="truncate">{companyNameOf(workshop.companyId)}</span>
        </p>

        <p className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          <span className="truncate">{workshop.address}</span>
        </p>

        <div className="mt-1 flex flex-wrap gap-4 border-t border-border pt-3">
          <span className="inline-flex items-center gap-1.5 text-sm tabular-nums">
            <Users className="size-4 text-muted-foreground" />
            {workshop.checkInsCount}
            <span className="text-xs text-muted-foreground">check-ins</span>
          </span>

          <span className="inline-flex items-center gap-1.5 text-sm tabular-nums">
            <Star className="size-4 text-primary" />
            {workshop.averageScore === null ? (
              <span className="text-xs text-muted-foreground">Sem avaliação</span>
            ) : (
              workshop.averageScore.toFixed(1)
            )}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 text-xs">
          <a
            href={workshop.checkinLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary underline underline-offset-2"
          >
            <ExternalLink className="size-3" />
            Check-in
          </a>
          <a
            href={workshop.assessmentLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary underline underline-offset-2"
          >
            <ExternalLink className="size-3" />
            Avaliação
          </a>
        </div>
      </CardContent>

      <CardFooter className="justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(workshop)}
          aria-label={`Editar oficina #${workshop.id}`}
        >
          <Pencil className="size-4" />
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(workshop)}
          aria-label={`Excluir oficina #${workshop.id}`}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" />
          Excluir
        </Button>
      </CardFooter>
    </Card>
  );
}
