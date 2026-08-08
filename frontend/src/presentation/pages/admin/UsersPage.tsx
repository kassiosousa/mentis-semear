import { ChevronLeft, ChevronRight, FilterX, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { User } from '@/domain/auth/entities/User';
import { USER_TYPES, isUserType, labelOfType } from '@/domain/auth/entities/User';
import { PageHeading } from '@/presentation/components/layout/PageHeading';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/presentation/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
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
import { useCurrentUser } from '@/presentation/hooks/useSession';
import { useDeleteUser, useUsers } from '@/presentation/hooks/useUsers';
import { UserFormDialog } from '@/presentation/pages/admin/UserFormDialog';

const ALL = 'todos';
const COLUMNS = 6;
const UNSUPPORTED_FIELD = 'A API ainda não retorna este campo.';

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function UsersPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState(ALL);
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<User | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<User | null>(null);

  const currentUser = useCurrentUser();
  const query = useUsers({ type: isUserType(type) ? type : undefined, page });
  const deleteUser = useDeleteUser();

  const users = useMemo(() => query.data?.users ?? [], [query.data]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (term === '') return users;

    return users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(term));
  }, [users, search]);

  const total = query.data?.total ?? 0;
  const perPage = query.data?.perPage ?? 0;
  const currentPage = query.data?.currentPage ?? page;
  const lastPage = perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1;
  const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  const filtering = search !== '' || type !== ALL;

  const changeType = (value: string) => {
    setType(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setType(ALL);
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setFormOpen(true);
  };

  const confirmDeletion = () => {
    if (pendingDeletion === null) return;

    deleteUser.mutate(pendingDeletion.id, {
      onSuccess: () => {
        toast.success('Usuário excluído.', { id: 'user-delete' });
        setPendingDeletion(null);
      },
      onError: (error) => {
        toast.error(error.message, { id: 'user-delete' });
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Usuários" subtitle="Usuários cadastrados na plataforma.">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="h-7 px-2.5">
            {query.isPending ? '—' : `${total} no total`}
          </Badge>

          <Button size="lg" onClick={openCreate}>
            <Plus className="size-4" />
            Novo usuário
          </Button>
        </div>
      </PageHeading>

      <Card>
        <CardHeader className="border-b">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto]">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-search" className="text-xs text-muted-foreground">
                Buscar
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="user-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Nome ou e-mail (nesta página)"
                  className="h-9 pl-8"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Empresa</Label>
              <Select value={ALL} disabled>
                <SelectTrigger title={UNSUPPORTED_FIELD}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Perfil</Label>
              <Select value={type} onValueChange={changeType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {USER_TYPES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {labelOfType(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={ALL} disabled>
                <SelectTrigger title={UNSUPPORTED_FIELD}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
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
                <TableHead className="pl-4">Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead title={UNSUPPORTED_FIELD}>Empresa</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead title={UNSUPPORTED_FIELD}>Status</TableHead>
                <TableHead className="pr-4 text-right">Ações</TableHead>
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
                      ? 'Nenhum usuário encontrado com esses filtros.'
                      : 'Nenhum usuário cadastrado.'}
                  </TableCell>
                </TableRow>
              )}

              {visible.map((user) => {
                const self = currentUser?.id === user.id;

                return (
                  <TableRow key={user.id}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-500/10 text-xs font-semibold text-secondary-700">
                          {initialsOf(user.name)}
                        </span>
                        <span className="font-medium text-title">{user.name}</span>
                        {self && (
                          <Badge variant="outline" className="text-[10px]">
                            você
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="text-muted-foreground">—</TableCell>
                    <TableCell>
                      <Badge variant="outline">{labelOfType(user.type)}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">—</TableCell>
                    <TableCell className="pr-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(user)}
                          title="Editar"
                          aria-label={`Editar ${user.name}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setPendingDeletion(user)}
                          disabled={self}
                          title={self ? 'Você não pode excluir a própria conta' : 'Excluir'}
                          aria-label={`Excluir ${user.name}`}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
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

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editing} />

      <Dialog
        open={pendingDeletion !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeletion(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir usuário</DialogTitle>
            <DialogDescription>
              {`"${pendingDeletion?.name ?? ''}" será removido permanentemente. Esta ação não pode ser desfeita.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setPendingDeletion(null)}
              disabled={deleteUser.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onClick={confirmDeletion}
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? 'Excluindo…' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
