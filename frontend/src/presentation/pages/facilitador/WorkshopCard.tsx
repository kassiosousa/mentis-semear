import { Building2, CalendarClock, MapPin, Pencil, Trash2 } from 'lucide-react';
import type { Workshop } from '@/domain/workshop/entities/Workshop';
import { Button } from '@/presentation/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import { AssessmentSummary, CheckInCount } from '@/presentation/pages/admin/WorkshopMetrics';
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
  workshop: Workshop;
  companyName: string;
  onOpen: (workshop: Workshop) => void;
  onEdit: (workshop: Workshop) => void;
  onDelete: (workshop: Workshop) => void;
  onShowQr: (label: string, url: string, workshopId: number) => void;
}

export function WorkshopCard({
  workshop,
  companyName,
  onOpen,
  onEdit,
  onDelete,
  onShowQr,
}: WorkshopCardProps) {
  const hasLinks = workshop.checkinLink !== null || workshop.assessmentLink !== null;

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
          <span className="truncate">{companyName}</span>
        </p>

        <p className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          <span className="truncate">{workshop.address}</span>
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-4 border-t border-border pt-3 text-sm">
          <CheckInCount workshopId={workshop.id} />
          <AssessmentSummary workshopId={workshop.id} />
        </div>

        {hasLinks && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3">
            {workshop.checkinLink !== null && (
              <WorkshopLinkRow
                compact
                label="Check-in"
                url={workshop.checkinLink}
                onShowQr={() => onShowQr('Check-in', workshop.checkinLink ?? '', workshop.id)}
              />
            )}
            {workshop.assessmentLink !== null && (
              <WorkshopLinkRow
                compact
                label="Avaliação"
                url={workshop.assessmentLink}
                onShowQr={() => onShowQr('Avaliação', workshop.assessmentLink ?? '', workshop.id)}
              />
            )}
          </div>
        )}
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
