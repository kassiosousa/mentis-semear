import { Building2, CalendarClock, MapPin, Pencil, Star, UserRound, Users } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { averageScore, type Workshop } from '@/domain/workshop/entities/Workshop';
import { Button } from '@/presentation/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import { useCurrentUser } from '@/presentation/hooks/useSession';
import { useWorkshopAssessments, useWorkshopCheckIns } from '@/presentation/hooks/useWorkshops';
import { WorkshopLinkRow } from '@/presentation/pages/facilitador/WorkshopLinkRow';
import { WorkshopStatusBadge } from '@/presentation/pages/facilitador/WorkshopStatusBadge';

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

function Metrics({ workshopId }: { workshopId: number }) {
  const checkIns = useWorkshopCheckIns(workshopId);
  const assessments = useWorkshopAssessments(workshopId);

  const average = assessments.data === undefined ? null : averageScore(assessments.data);

  return (
    <>
      <Field icon={Users} label="Check-ins">
        {checkIns.isPending ? (
          <Skeleton className="h-4 w-10" />
        ) : checkIns.isError ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <span className="tabular-nums">{checkIns.data.length}</span>
        )}
      </Field>

      <Field icon={Star} label="Nota média">
        {assessments.isPending ? (
          <Skeleton className="h-4 w-10" />
        ) : assessments.isError ? (
          <span className="text-muted-foreground">—</span>
        ) : average === null ? (
          <span className="text-muted-foreground">Sem avaliação</span>
        ) : (
          <span className="tabular-nums">
            {average.toFixed(1)}
            <span className="ml-1 text-xs text-muted-foreground">
              ({assessments.data.length})
            </span>
          </span>
        )}
      </Field>
    </>
  );
}

interface WorkshopDetailDialogProps {
  workshop: Workshop | null;
  companyName: string;
  onOpenChange: (open: boolean) => void;
  onEdit: (workshop: Workshop) => void;
  onShowQr: (label: string, url: string, workshopId: number) => void;
}

export function WorkshopDetailDialog({
  workshop,
  companyName,
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
            {workshop !== null && <WorkshopStatusBadge workshop={workshop} />}
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
                {companyName}
              </Field>

              <Field icon={MapPin} label="Local">
                {workshop.address}
              </Field>

              <Field icon={UserRound} label="Aplicador">
                {workshop.facilitatorId === user?.id ? (user?.name ?? '—') : 'Não atribuído'}
              </Field>

              <Metrics workshopId={workshop.id} />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">Links de participação</p>

              {workshop.checkinLink === null && workshop.assessmentLink === null ? (
                <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
                  A API ainda não retornou os links desta oficina.
                </p>
              ) : (
                <>
                  {workshop.checkinLink !== null && (
                    <WorkshopLinkRow
                      label="Check-in"
                      url={workshop.checkinLink}
                      onShowQr={() =>
                        onShowQr('Check-in', workshop.checkinLink ?? '', workshop.id)
                      }
                    />
                  )}
                  {workshop.assessmentLink !== null && (
                    <WorkshopLinkRow
                      label="Avaliação"
                      url={workshop.assessmentLink}
                      onShowQr={() =>
                        onShowQr('Avaliação', workshop.assessmentLink ?? '', workshop.id)
                      }
                    />
                  )}
                </>
              )}
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
