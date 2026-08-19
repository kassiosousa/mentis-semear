import { ChevronLeft, ChevronRight, Eye, FilterX, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { actionOf, isSuccessStatus } from '@/domain/log/entities/Log';
import { DEFAULT_LOG_PER_PAGE, LOG_PER_PAGE_OPTIONS } from '@/domain/log/repositories/LogRepository';
import { ForbiddenError } from '@/domain/shared/errors/AppError';
import { PageHeading } from '@/presentation/components/layout/PageHeading';
import { LogDetailDialog } from '@/presentation/components/log/LogDetailDialog';
import { LogMethodBadge } from '@/presentation/components/log/LogMethodBadge';
import { Alert, AlertDescription, AlertTitle } from '@/presentation/components/ui/alert';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/presentation/components/ui/card';
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
import { useUsers } from '@/presentation/hooks/useUsers';

export type LogScope = 'admin' | 'empresa';

const ALL = 'todos';
const COLUMNS = 6;
const USERS_RESTRICTED = 'A listagem de usuários é restrita a administradores.';

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

export function LogsListing({ scope }: { scope: LogScope }) {
  const isAdmin = scope === 'admin';

  const [userId, setUserId] = useState(ALL);
  const [perPage, setPerPage] = useState<number>(DEFAULT_LOG_PER_PAGE);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);

  const usersQuery = useUsers({ page: 1 }, isAdmin);
  const query = useLogs(
    { userId: userId === ALL ? undefined : userId, page, perPage },
    { silentError: !isAdmin },
  );

  const users = useMemo(() => usersQuery.data?.users ?? [], [usersQuery.data]);
  const userById = useMemo(() => new Map(users.map((user) => [user.id, user.name])), [users]);

  const userName = (id: string | null): string => {
    if (id === null) return 'Sistema / anônimo';

    return userById.get(id) ?? `#${id.slice(0, 8)}`;
  };

  const logs = query.data?.logs ?? [];
  const total = query.data?.total ?? 0;
  const currentPage = query.data?.currentPage ?? page;
  const lastPage = query.data?.lastPage ?? 1;
  const pageSize = query.data?.perPage ?? perPage;
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  const filteringUser = userId !== ALL;
  const filtering = filteringUser || perPage !== DEFAULT_LOG_PER_PAGE;
  const forbidden = query.error instanceof ForbiddenError;
  const partialUsers = usersQuery.isSuccess && (usersQuery.data?.total ?? 0) > users.length;

  const changeUser = (value: string) => {
    setUserId(value);
    setPage(1);
  };

  const changePerPage = (value: string) => {
    setPerPage(Number(value));
    setPage(1);
  };

  const clearFilters = () => {
    setUserId(ALL);
    setPerPage(DEFAULT_LOG_PER_PAGE);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Relatórios"
        subtitle={
          isAdmin
            ? 'Logs de auditoria das ações registradas na plataforma.'
            : 'Logs de auditoria das ações registradas na sua empresa.'
        }
      >
        <Badge variant="secondary" className="h-7 px-2.5">
          {query.isSuccess ? `${total} no total` : '—'}
        </Badge>
      </PageHeading>

      {forbidden && (
        <Alert variant="destructive">
          <ShieldAlert />
          <AlertTitle>Acesso restrito</AlertTitle>
          <AlertDescription>
            A rota <span className="font-mono">GET /api/logs</span> está liberada apenas para o
            perfil administrador. Solicite a liberação do seu perfil no backend para visualizar
            estes registros.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="border-b">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Usuário</Label>
              <Select value={userId} onValueChange={changeUser} disabled={!isAdmin}>
                <SelectTrigger title={isAdmin ? undefined : USERS_RESTRICTED}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {partialUsers && (
                <p className="text-[11px] text-muted-foreground">
                  {`Listando os ${users.length} primeiros usuários.`}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Itens por página</Label>
              <Select value={String(perPage)} onValueChange={changePerPage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOG_PER_PAGE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
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
                <TableHead className="pl-4">Ação</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Data e hora</TableHead>
                <TableHead className="pr-4 text-right">Detalhes</TableHead>
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
                    {forbidden ? 'Sem permissão para consultar os logs.' : query.error.message}
                  </TableCell>
                </TableRow>
              )}

              {query.isSuccess && logs.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={COLUMNS}
                    className="py-10 text-center text-sm whitespace-normal text-muted-foreground"
                  >
                    {filteringUser
                      ? 'Nenhum log registrado para este usuário.'
                      : 'Nenhum log registrado.'}
                  </TableCell>
                </TableRow>
              )}

              {logs.map((log) => {
                const action = actionOf(log);

                return (
                  <TableRow key={log.id}>
                    <TableCell className="pl-4">
                      <LogMethodBadge method={action.method} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {action.path ?? log.description}
                    </TableCell>
                    <TableCell>
                      {action.status === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <Badge
                          variant={isSuccessStatus(action.status) ? 'secondary' : 'destructive'}
                        >
                          {action.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{userName(log.userId)}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {formatDateTime(log.createdAt)}
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setSelected(log.id)}
                          title="Ver detalhes"
                          aria-label={`Ver detalhes do log ${log.id}`}
                        >
                          <Eye className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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

      <LogDetailDialog
        logId={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        userName={userName}
        formatDateTime={formatDateTime}
      />
    </div>
  );
}
