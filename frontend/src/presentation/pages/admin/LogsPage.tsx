import { ChevronLeft, ChevronRight, FileDown, FilterX, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Log, LogAction, LogMethod } from '@/domain/log/entities/Log';
import { LOG_METHODS, actionOf, isSuccessStatus } from '@/domain/log/entities/Log';
import {
  DEFAULT_LOG_PER_PAGE,
  LOG_PER_PAGE_OPTIONS,
} from '@/domain/log/repositories/LogRepository';
import type { PdfColumn } from '@/lib/pdf';
import { PageHeading } from '@/presentation/components/layout/PageHeading';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import { useLogs } from '@/presentation/hooks/useLogs';
import { useLogsPdf } from '@/presentation/hooks/useLogsPdf';
import { useUsers } from '@/presentation/hooks/useUsers';

const ALL = 'todos';
const COLUMNS = 5;

const METHOD_CLASS: Record<LogMethod, string> = {
  POST: 'bg-primary-500/12 text-primary-700',
  PUT: 'bg-gold/15 text-gold',
  PATCH: 'bg-secondary-500/12 text-secondary-700',
  DELETE: 'bg-destructive/10 text-destructive',
};

interface LogEntry {
  log: Log;
  action: LogAction;
}

function toEntries(logs: readonly Log[]): LogEntry[] {
  return logs.map((log) => ({ log, action: actionOf(log) }));
}

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
        second: '2-digit',
      });
}

export function LogsPage() {
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState(ALL);
  const [perPage, setPerPage] = useState<number>(DEFAULT_LOG_PER_PAGE);
  const [page, setPage] = useState(1);

  const users = useUsers({ page: 1 });
  const query = useLogs({ page, perPage });

  const userName = useMemo(() => {
    const byId = new Map((users.data?.users ?? []).map((user) => [user.id, user.name]));

    return (id: string) => byId.get(id) ?? `#${id.slice(0, 8)}`;
  }, [users.data]);

  const matches = useMemo(() => {
    const term = search.trim().toLowerCase();

    return ({ log, action }: LogEntry) => {
      if (method !== ALL && action.method !== method) return false;
      if (term === '') return true;

      const author = log.userId === null ? '' : userName(log.userId);

      return `${log.description} ${author}`.toLowerCase().includes(term);
    };
  }, [method, search, userName]);

  const entries = useMemo(() => toEntries(query.data?.logs ?? []), [query.data]);
  const visible = useMemo(() => entries.filter(matches), [entries, matches]);

  const total = query.data?.total ?? 0;
  const currentPage = query.data?.currentPage ?? page;
  const lastPage = query.data?.lastPage ?? 1;
  const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  const filtering = search !== '' || method !== ALL;

  const pdfColumns = useMemo<PdfColumn<LogEntry>[]>(
    () => [
      { header: 'Quando', value: ({ log }) => formatDateTime(log.createdAt), width: 104 },
      { header: 'Método', value: ({ action }) => action.method ?? '—', width: 52 },
      { header: 'Rota', value: ({ log, action }) => action.path ?? log.description },
      {
        header: 'Status',
        value: ({ action }) => (action.status === null ? '—' : String(action.status)),
        width: 44,
      },
      {
        header: 'Usuário',
        value: ({ log }) => (log.userId === null ? 'Sistema' : userName(log.userId)),
        width: 108,
      },
    ],
    [userName],
  );

  const pdfSubtitle = useMemo(() => {
    const applied = [
      method === ALL ? null : `método ${method}`,
      search.trim() === '' ? null : `busca "${search.trim()}"`,
    ].filter((part) => part !== null);

    return applied.length === 0
      ? 'Todos os registros'
      : `Filtros aplicados: ${applied.join(' · ')}`;
  }, [method, search]);

  const pdf = useLogsPdf({
    select: (logs) => toEntries(logs).filter(matches),
    columns: pdfColumns,
    subtitle: pdfSubtitle,
  });

  const changePerPage = (value: string) => {
    setPerPage(Number(value));
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setMethod(ALL);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Logs"
        subtitle="Registro automático das ações que alteram dados na plataforma."
      >
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="h-7 px-2.5">
            {query.isPending ? '—' : `${total} no total`}
          </Badge>

          <Button variant="outline" size="lg" onClick={pdf.run} disabled={pdf.exporting}>
            <FileDown className="size-4" />
            {pdf.exporting ? 'Exportando…' : 'Exportar PDF'}
          </Button>
        </div>
      </PageHeading>

      <Card>
        <CardHeader className="border-b">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))_auto]">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="log-search" className="text-xs text-muted-foreground">
                Buscar
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="log-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rota ou usuário (nesta página)"
                  className="h-9 pl-8"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Método</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {LOG_METHODS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Por página</Label>
              <Select value={String(perPage)} onValueChange={changePerPage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOG_PER_PAGE_OPTIONS.map((value) => (
                    <SelectItem key={value} value={String(value)}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                disabled={!filtering}
                className="h-9 w-full xl:w-auto"
              >
                <FilterX className="size-4" />
                Limpar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Quando</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Rota</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4">Usuário</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {query.isPending &&
                Array.from({ length: 5 }, (_, index) => (
                  <TableRow key={index} className="hover:bg-transparent">
                    <TableCell colSpan={COLUMNS} className="px-4">
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {query.isError && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={COLUMNS}
                    className="py-10 text-center text-sm whitespace-normal text-destructive"
                  >
                    {query.error.message}
                  </TableCell>
                </TableRow>
              )}

              {query.isSuccess && visible.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={COLUMNS}
                    className="py-10 text-center text-sm whitespace-normal text-muted-foreground"
                  >
                    {filtering
                      ? 'Nenhum log encontrado com esses filtros.'
                      : 'Nenhuma ação registrada até agora.'}
                  </TableCell>
                </TableRow>
              )}

              {visible.map(({ log, action }) => (
                <TableRow key={log.id}>
                  <TableCell className="pl-4 tabular-nums whitespace-nowrap text-muted-foreground">
                    {formatDateTime(log.createdAt)}
                  </TableCell>

                  <TableCell>
                    {action.method === null ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span
                        className={`inline-flex rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold ${METHOD_CLASS[action.method]}`}
                      >
                        {action.method}
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="font-mono text-xs break-all text-title">
                    {action.path ?? log.description}
                  </TableCell>

                  <TableCell>
                    {action.status === null ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <Badge variant={isSuccessStatus(action.status) ? 'outline' : 'destructive'}>
                        {action.status}
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="pr-4 text-muted-foreground">
                    {log.userId === null ? 'Sistema' : userName(log.userId)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="justify-between gap-4">
          <span className="text-xs text-muted-foreground">
            {total === 0 ? 'Nenhum registro' : `Mostrando ${from}–${to} de ${total}`}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage <= 1 || query.isFetching}
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>

            <span className="text-xs tabular-nums text-muted-foreground">
              {currentPage} / {lastPage}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((value) => value + 1)}
              disabled={currentPage >= lastPage || query.isFetching}
            >
              Próxima
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
