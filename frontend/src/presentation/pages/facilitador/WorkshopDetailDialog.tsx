import { Building2, CalendarClock, MapPin, Pencil, Star, UserRound, Users } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { useCurrentUser } from '@/presentation/hooks/useSession';
import {
  companyNameOf,
  isPastWorkshop,
  type FacilitatorWorkshop,
} from '@/presentation/pages/facilitador/mockWorkshops';
import { WorkshopLinkRow } from '@/presentation/pages/facilitador/WorkshopLinkRow';

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm break-words text-title">{children}</div>
      </div>
    </div>
  );
}

interface WorkshopDetailDialogProps {
  workshop: FacilitatorWorkshop | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (workshop: FacilitatorWorkshop) => void;
  onShowQr: (label: string, url: string, workshopId: number) => void;
}

export function WorkshopDetailDialog({
  workshop,
  onOpenChange,
  onEdit,
  onShowQr,
}: WorkshopDetailDialogProps) {
  const user = useCurrentUser();

  return (
    <Dialog open={workshop !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Oficina #{workshop?.id ?? ''}
            {workshop !== null && (
              <Badge variant={isPastWorkshop(workshop) ? 'secondary' : 'default'}>
                {isPastWorkshop(workshop) ? 'Realizada' : 'Agendada'}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>Dados do encontro e links de participação.</DialogDescription>
        </DialogHeader>

        {workshop !== null && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={CalendarClock} label="Data e hora">
                <span className="capitalize">{formatDateTime(workshop.datetime)}</span>
              </Field>

              <Field icon={Building2} label="Empresa">
                {companyNameOf(workshop.companyId)}
              </Field>

              <Field icon={MapPin} label="Local">
                {workshop.address}
              </Field>

              <Field icon={UserRound} label="Aplicador">
                {user?.name ?? '—'}
              </Field>

              <Field icon={Users} label="Check-ins">
                <span className="tabular-nums">{workshop.checkInsCount}</span>
              </Field>

              <Field icon={Star} label="Nota média">
                {workshop.averageScore === null ? (
                  <span className="text-muted-foreground">Sem avaliação</span>
                ) : (
                  <span className="tabular-nums">{workshop.averageScore.toFixed(1)}</span>
                )}
              </Field>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">Links de participação</p>

              <WorkshopLinkRow
                label="Check-in"
                url={workshop.checkinLink}
                onShowQr={() => onShowQr('Check-in', workshop.checkinLink, workshop.id)}
              />

              <WorkshopLinkRow
                label="Avaliação"
                url={workshop.assessmentLink}
                onShowQr={() => onShowQr('Avaliação', workshop.assessmentLink, workshop.id)}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" size="lg" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              <Button size="lg" onClick={() => onEdit(workshop)}>
                <Pencil className="size-4" />
                Editar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
