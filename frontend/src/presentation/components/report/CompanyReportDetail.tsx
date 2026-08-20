import { ArrowLeft, CalendarRange, HeartPulse, Layers, Star, Users } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { moodLabel, moodScoreFromAverage } from '@/domain/mood/entities/MoodSummary';
import type { SectorMoodPoint } from '@/domain/report/entities/Report';
import { ForbiddenError } from '@/domain/shared/errors/AppError';
import type { CsvColumn } from '@/lib/csv';
import { PageHeading } from '@/presentation/components/layout/PageHeading';
import { MoodFace, MoodFaceBadge } from '@/presentation/components/mood/MoodFace';
import { moodBarClass } from '@/presentation/components/mood/moodTone';
import {
  AccessAlert,
  ReportCsvButton,
  ReportStatGrid,
} from '@/presentation/components/report/ReportPanel';
import { formatDecimal, formatNumber } from '@/presentation/components/report/reportFormat';
import { Button } from '@/presentation/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import { useReportCsv } from '@/presentation/hooks/useReportCsv';
import { useCompanyPanelReport } from '@/presentation/hooks/useReports';

const ENDPOINT = '/api/reports/company/{company}';

const CSV_COLUMNS: CsvColumn<SectorMoodPoint>[] = [
  { header: 'Setor', value: (row) => row.sector },
  { header: 'Registros', value: (row) => row.total },
  { header: 'Humor médio', value: (row) => row.average },
  { header: 'Descrição', value: (row) => moodLabel(moodScoreFromAverage(row.average)) },
];

export function CompanyReportDetail({ companyId }: { companyId: number }) {
  const report = useCompanyPanelReport(companyId);

  const panel = report.data;
  const mood = panel?.mood;
  const averageScore = moodScoreFromAverage(mood?.average ?? null);
  const forbidden = report.error instanceof ForbiddenError;

  const peak = mood === undefined ? 0 : Math.max(...mood.distribution.map((it) => it.total), 0);
  const sectors = mood?.bySector ?? [];

  const csv = useReportCsv({
    name: `empresa-${panel?.company ?? companyId}`,
    columns: CSV_COLUMNS,
    load: async () => ({ rows: sectors, truncated: false }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link to="/admin/relatorios">
            <ArrowLeft className="size-4" />
            Voltar para relatórios
          </Link>
        </Button>

        <PageHeading
          title={panel?.company ?? `Empresa #${companyId}`}
          subtitle="Painel consolidado de oficinas, alcance, satisfação e termômetro emocional."
        >
          <ReportCsvButton {...csv} disabled={sectors.length === 0} />
        </PageHeading>
      </div>

      {forbidden && <AccessAlert endpoint={ENDPOINT} />}

      {report.isError && !forbidden && (
        <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-destructive">
          {report.error.message}
        </p>
      )}

      {!report.isError && (
        <>
          <ReportStatGrid
            loading={report.isPending}
            items={[
              {
                label: 'Oficinas',
                value: formatNumber(panel?.workshops ?? null),
                icon: CalendarRange,
              },
              {
                label: 'Alcance',
                value: formatNumber(panel?.checkIns ?? null),
                hint: 'Check-ins registrados',
                icon: Users,
              },
              {
                label: 'Satisfação média',
                value: formatDecimal(panel?.satisfaction.average ?? null),
                hint: `${formatNumber(panel?.satisfaction.total ?? null)} respostas`,
                icon: Star,
              },
              {
                label: 'Humor médio',
                value: formatDecimal(panel?.mood.average ?? null, 2),
                hint: averageScore === null ? 'Escala de 1 a 5' : moodLabel(averageScore),
                icon: HeartPulse,
              },
            ]}
          />

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <HeartPulse className="size-4 text-primary" />
                Termômetro emocional
              </CardTitle>
              <CardDescription>Respostas anônimas registradas pela empresa.</CardDescription>
            </CardHeader>

            <CardContent>
              {report.isPending && <Skeleton className="h-40 w-full" />}

              {mood !== undefined && mood.total === 0 && (
                <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhuma resposta registrada para esta empresa.
                </p>
              )}

              {mood !== undefined && mood.total > 0 && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <MoodFaceBadge score={averageScore} label={moodLabel(averageScore)} />

                    <div>
                      <p className="text-xs text-muted-foreground">Humor médio</p>
                      <p className="text-3xl font-semibold tabular-nums text-title">
                        {formatDecimal(mood.average, 2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(mood.total)} respostas
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground">Distribuição</p>

                    {mood.distribution.map((entry) => {
                      const share = peak === 0 ? 0 : Math.round((entry.total / peak) * 100);
                      const percent = Math.round((entry.total / mood.total) * 100);

                      return (
                        <div key={entry.mood} className="flex items-center gap-3">
                          <span className="flex w-24 shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:w-28">
                            <MoodFace score={entry.mood} size="sm" />
                            <span className="truncate">{moodLabel(entry.mood)}</span>
                          </span>

                          <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full transition-[width] ${moodBarClass(entry.mood)}`}
                              style={{ width: `${share}%` }}
                            />
                          </div>

                          <span className="w-16 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                            {entry.total} · {percent}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                Termômetro por setor
              </CardTitle>
              <CardDescription>Volume e humor médio de cada setor da empresa.</CardDescription>
            </CardHeader>

            <CardContent className="px-0">
              {report.isPending && (
                <div className="px-4">
                  {Array.from({ length: 4 }, (_, index) => (
                    <Skeleton key={index} className="mb-2 h-8 w-full" />
                  ))}
                </div>
              )}

              {!report.isPending && (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-4">Setor</TableHead>
                      <TableHead className="text-right">Registros</TableHead>
                      <TableHead className="pr-4 text-right">Humor médio</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {sectors.length === 0 && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          colSpan={3}
                          className="py-10 text-center text-sm whitespace-normal text-muted-foreground"
                        >
                          Nenhum setor com registros do termômetro.
                        </TableCell>
                      </TableRow>
                    )}

                    {sectors.map((entry) => (
                      <TableRow key={entry.sectorId ?? entry.sector}>
                        <TableCell className="pl-4">{entry.sector}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(entry.total)}
                        </TableCell>
                        <TableCell className="pr-4">
                          <span className="flex items-center justify-end gap-2 tabular-nums">
                            <MoodFace score={moodScoreFromAverage(entry.average)} size="sm" />
                            {formatDecimal(entry.average, 2)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
