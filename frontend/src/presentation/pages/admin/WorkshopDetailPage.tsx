import { Link } from '@tanstack/react-router';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ClipboardList,
  MapPin,
  Star,
  UserRound,
  Users,
} from 'lucide-react';
import { useState, type ComponentType, type ReactNode } from 'react';
import { averageScore } from '@/domain/workshop/entities/Workshop';
import { PageHeading } from '@/presentation/components/layout/PageHeading';
import { Badge } from '@/presentation/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import { WorkshopLinkRow } from '@/presentation/components/workshop/WorkshopLinkRow';
import { useDirectory } from '@/presentation/hooks/useDirectory';
import {
  useWorkshop,
  useWorkshopAssessments,
  useWorkshopCheckIns,
} from '@/presentation/hooks/useWorkshops';
import { workshopDetailRoute } from '@/presentation/routes/modules/admin.routes';

const CHECKIN_COLUMNS = 7;

function formatDateTime(value: string | null): string {
  if (value === null) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

function formatDate(value: string | null): string {
  if (value === null) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
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
  const { id } = workshopDetailRoute.useParams();
  const workshopId = Number(id);

  const [qrTarget, setQrTarget] = useState<QrTarget | null>(null);

  const showQr = (label: string, url: string) => {
    setQrTarget({
      title: `QR Code — ${label}`,
      description: `Oficina #${workshopId}. Aponte a câmera para acessar o formulário.`,
      url,
      fileName: `oficina-${workshopId}-${label.toLowerCase().replace(/\W+/g, '-')}`,
    });
  };

  const directory = useDirectory();
  const workshop = useWorkshop(workshopId);
  const checkIns = useWorkshopCheckIns(workshopId);
  const assessments = useWorkshopAssessments(workshopId);

  const thermometerLink =
    workshop.data === undefined ? null : directory.thermometerLink(workshop.data.companyId);

  const average = assessments.data === undefined ? null : averageScore(assessments.data);
  const suggestions = (assessments.data ?? []).filter(
    (assessment) => assessment.suggestions !== null && assessment.suggestions.trim() !== '',
  );

  const distribution = (assessments.data ?? []).reduce<Map<number, number>>((counts, item) => {
    counts.set(item.score, (counts.get(item.score) ?? 0) + 1);
    return counts;
  }, new Map());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link to="/admin/oficinas">
            <ArrowLeft className="size-4" />
            Voltar para oficinas
          </Link>
        </Button>

        <PageHeading
          title={`Oficina #${id}`}
          subtitle={workshop.data === undefined ? undefined : formatDateTime(workshop.data.datetime)}
        />
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="size-4 text-primary" />
            Dados do cadastro
          </CardTitle>
          <CardDescription>Informações da oficina e quem vai aplicar.</CardDescription>
        </CardHeader>

        <CardContent>
          {workshop.isPending && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          )}

          {workshop.isError && <p className="text-sm text-destructive">{workshop.error.message}</p>}

          {workshop.isSuccess && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field icon={CalendarDays} label="Data e hora">
                {formatDateTime(workshop.data.datetime)}
              </Field>

              <Field icon={Building2} label="Empresa">
                {directory.companyName(workshop.data.companyId)}
              </Field>

              <Field icon={UserRound} label="Aplicador">
                {directory.facilitatorName(workshop.data.facilitatorId) ?? 'Não atribuído'}
              </Field>

              <Field icon={MapPin} label="Local">
                {workshop.data.address}
              </Field>

              <Field icon={CalendarDays} label="Cadastrada em">
                {formatDateTime(workshop.data.createdAt)}
              </Field>
            </div>
          )}

          {workshop.isSuccess && (
            <div className="mt-5 flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">Links de participação</p>

              {workshop.data.checkinLink === null &&
              workshop.data.assessmentLink === null &&
              thermometerLink === null ? (
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
                  {thermometerLink !== null && (
                    <WorkshopLinkRow
                      label="Termômetro do setor"
                      url={thermometerLink}
                      onShowQr={() => showQr('Termômetro do setor', thermometerLink)}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            Check-ins registrados
          </CardTitle>
          <CardDescription>
            {checkIns.isSuccess
              ? `${checkIns.data.length} participante(s).`
              : 'Participantes que confirmaram presença.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>LGPD</TableHead>
                <TableHead className="pr-4">Registrado em</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {checkIns.isPending &&
                Array.from({ length: 3 }, (_, index) => (
                  <TableRow key={index} className="hover:bg-transparent">
                    <TableCell colSpan={CHECKIN_COLUMNS} className="px-4">
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {checkIns.isError && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={CHECKIN_COLUMNS}
                    className="py-10 text-center text-sm whitespace-normal text-destructive"
                  >
                    {checkIns.error.message}
                  </TableCell>
                </TableRow>
              )}

              {checkIns.isSuccess && checkIns.data.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={CHECKIN_COLUMNS}
                    className="py-10 text-center text-sm whitespace-normal text-muted-foreground"
                  >
                    Nenhum check-in registrado.
                  </TableCell>
                </TableRow>
              )}

              {(checkIns.data ?? []).map((checkIn) => (
                <TableRow key={checkIn.id}>
                  <TableCell className="pl-4 font-medium text-title">{checkIn.name}</TableCell>
                  <TableCell className="text-muted-foreground">{checkIn.position ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{checkIn.sector ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{checkIn.email ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{checkIn.celphone ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={checkIn.lgpdRead ? 'secondary' : 'outline'}>
                      {checkIn.lgpdRead ? 'Aceito' : 'Pendente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-4 text-muted-foreground">
                    {formatDate(checkIn.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Star className="size-4 text-primary" />
            Pesquisa de avaliação
          </CardTitle>
          <CardDescription>Notas de 0 a 10 e sugestões deixadas pelos participantes.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {assessments.isPending && <Skeleton className="h-24 w-full" />}

          {assessments.isError && (
            <p className="text-sm text-destructive">{assessments.error.message}</p>
          )}

          {assessments.isSuccess && assessments.data.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma avaliação respondida.</p>
          )}

          {assessments.isSuccess && assessments.data.length > 0 && (
            <>
              <div className="flex flex-wrap items-end gap-8">
                <div>
                  <p className="text-xs text-muted-foreground">Nota média</p>
                  <p className="text-4xl font-semibold tabular-nums text-title">
                    {average?.toFixed(1) ?? '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Respostas</p>
                  <p className="text-4xl font-semibold tabular-nums text-title">
                    {assessments.data.length}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs text-muted-foreground">Distribuição das notas</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 11 }, (_, score) => score)
                    .filter((score) => distribution.has(score))
                    .map((score) => (
                      <Badge key={score} variant="outline" className="tabular-nums">
                        {score}: {distribution.get(score)}
                      </Badge>
                    ))}
                </div>
              </div>

              {suggestions.length > 0 && (
                <div>
                  <p className="mb-2 text-xs text-muted-foreground">Sugestões</p>
                  <ul className="flex flex-col gap-2">
                    {suggestions.map((assessment) => (
                      <li
                        key={assessment.id}
                        className="rounded-lg border border-border p-3 text-sm"
                      >
                        <span className="mr-2 font-medium tabular-nums text-primary">
                          {assessment.score}
                        </span>
                        {assessment.suggestions}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <QrCodeDialog
        target={qrTarget}
        onOpenChange={(open) => {
          if (!open) setQrTarget(null);
        }}
      />
    </div>
  );
}
