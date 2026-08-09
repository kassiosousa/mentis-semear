import { Building2, CalendarClock, MapPin, Pencil, Star, Trash2, Users } from 'lucide-react';
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
  type FacilitatorWorkshop,
} from '@/presentation/pages/facilitador/mockWorkshops';
import { WorkshopLinkRow } from '@/presentation/pages/facilitador/WorkshopLinkRow';
import { WorkshopStatusBadge } from '@/presentation/pages/facilitador/WorkshopStatusBadge';

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
  onOpen: (workshop: FacilitatorWorkshop) => void;
  onEdit: (workshop: FacilitatorWorkshop) => void;
  onDelete: (workshop: FacilitatorWorkshop) => void;
  onShowQr: (label: string, url: string, workshopId: number) => void;
}

export function WorkshopCard({
  workshop,
  onOpen,
  onEdit,
  onDelete,
  onShowQr,
}: WorkshopCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Oficina #{workshop.id}</CardTitle>
        <CardAction>
          <WorkshopStatusBadge workshop={workshop} />
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

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3">
          <WorkshopLinkRow
            compact
            label="Check-in"
            url={workshop.checkinLink}
            onShowQr={() => onShowQr('Check-in', workshop.checkinLink, workshop.id)}
          />
          <WorkshopLinkRow
            compact
            label="Avaliação"
            url={workshop.assessmentLink}
            onShowQr={() => onShowQr('Avaliação', workshop.assessmentLink, workshop.id)}
          />
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-1">
        <Button variant="outline" size="sm" onClick={() => onOpen(workshop)}>
          Ver detalhes
        </Button>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(workshop)}
            title="Editar"
            aria-label={`Editar oficina #${workshop.id}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(workshop)}
            title="Excluir"
            aria-label={`Excluir oficina #${workshop.id}`}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
