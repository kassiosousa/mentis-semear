import { Link } from '@tanstack/react-router';
import { ArrowLeft, Building2, CalendarClock, MapPin, Star, UserRound, Users } from 'lucide-react';
import { useState, type ComponentType, type ReactNode } from 'react';
import { averageScore } from '@/domain/workshop/entities/Workshop';
import { PageHeading } from '@/presentation/components/layout/PageHeading';
import { Button } from '@/presentation/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import { QrCodeDialog, type QrTarget } from '@/presentation/components/ui/qr-code-dialog';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import { useDirectory } from '@/presentation/hooks/useDirectory';
import { useCurrentUser } from '@/presentation/hooks/useSession';
import {
  useWorkshop,
  useWorkshopAssessments,
  useWorkshopCheckIns,
} from '@/presentation/hooks/useWorkshops';
import { DiarySection } from '@/presentation/pages/facilitador/DiarySection';
import { WorkshopLinkRow } from '@/presentation/components/workshop/WorkshopLinkRow';
import { WorkshopStatusBadge } from '@/presentation/pages/facilitador/WorkshopStatusBadge';
import { facilitadorWorkshopRoute } from '@/presentation/routes/modules/facilitador.routes';

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

export function WorkshopDetailPage() {
  const { id } = facilitadorWorkshopRoute.useParams();
  const workshopId = Number(id);

  const [qrTarget, setQrTarget] = useState<QrTarget | null>(null);

  const user = useCurrentUser();
  const directory = useDirectory({ facilitators: false });
  const workshop = useWorkshop(workshopId);
  const checkIns = useWorkshopCheckIns(workshopId);
  const assessments = useWorkshopAssessments(workshopId);

  const average = assessments.data === undefined ? null : averageScore(assessments.data);

  const showQr = (label: string, url: string) => {
    setQrTarget({
      title: `QR Code — ${label}`,
      description: `Oficina #${workshopId}. Aponte a câmera para acessar o formulário.`,
      url,
      fileName: `oficina-${workshopId}-${label.toLowerCase().replace(/\W+/g, '-')}`,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link to="/facilitador">
            <ArrowLeft className="size-4" />
            Voltar para o painel
          </Link>
        </Button>

        <PageHeading
          title={`Oficina #${id}`}
          subtitle={
            workshop.data === undefined ? undefined : formatDateTime(workshop.data.datetime)
          }
        >
          {workshop.isSuccess && <WorkshopStatusBadge workshop={workshop.data} />}
        </PageHeading>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="size-4 text-primary" />
            Dados do encontro
          </CardTitle>
          <CardDescription>Informações da oficina e links de participação.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          {workshop.isPending && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          )}

          {workshop.isError && <p className="text-sm text-destructive">{workshop.error.message}</p>}

          {workshop.isSuccess && (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <Field icon={CalendarClock} label="Data e hora">
                  <span className="capitalize">{formatDateTime(workshop.data.datetime)}</span>
                </Field>

                <Field icon={Building2} label="Empresa">
                  {directory.companyName(workshop.data.companyId)}
                </Field>

                <Field icon={MapPin} label="Local">
                  {workshop.data.address}
                </Field>

                <Field icon={UserRound} label="Aplicador">
                  {workshop.data.facilitatorId === user?.id
                    ? (user?.name ?? '—')
                    : 'Outro aplicador'}
                </Field>

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
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-muted-foreground">Links de participação</p>

                {workshop.data.checkinLink === null && workshop.data.assessmentLink === null ? (
                  <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
                    A API ainda não retornou os links desta oficina.
                  </p>
                ) : (
                  <>
                    {workshop.data.checkinLink !== null && (
                      <WorkshopLinkRow
                        label="Check-in"
                        url={workshop.data.checkinLink}
                        onShowQr={() => showQr('Check-in', workshop.data.checkinLink ?? '')}
                      />
                    )}
                    {workshop.data.assessmentLink !== null && (
                      <WorkshopLinkRow
                        label="Avaliação"
                        url={workshop.data.assessmentLink}
                        onShowQr={() => showQr('Avaliação', workshop.data.assessmentLink ?? '')}
                      />
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {workshop.isSuccess && (
        <DiarySection workshopId={workshopId} workshopDatetime={workshop.data.datetime} />
      )}

      <QrCodeDialog
        target={qrTarget}
        onOpenChange={(open) => {
          if (!open) setQrTarget(null);
        }}
      />
    </div>
  );
}
