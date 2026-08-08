import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Company } from '@/domain/company/entities/Company';
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
import { Skeleton } from '@/presentation/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import { useCompanies, useDeleteCompany } from '@/presentation/hooks/useCompanies';
import { CompanyFormDialog } from '@/presentation/pages/admin/CompanyFormDialog';

const COLUMNS = 5;
const SEARCH_DEBOUNCE_MS = 400;

function formatDate(value: string | null): string {
  if (value === null) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
}

export function CompaniesPage() {
  const [term, setTerm] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<Company | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<Company | null>(null);

  const query = useCompanies({ search, page });
  const deleteCompany = useDeleteCompany();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(term);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [term]);

  const companies = query.data?.companies ?? [];
  const total = query.data?.total ?? 0;
  const perPage = query.data?.perPage ?? 0;
  const currentPage = query.data?.currentPage ?? page;
  const lastPage = perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1;
  const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (company: Company) => {
    setEditing(company);
    setFormOpen(true);
  };

  const confirmDeletion = () => {
    if (pendingDeletion === null) return;

    deleteCompany.mutate(pendingDeletion.id, {
      onSuccess: () => {
        toast.success('Empresa excluída.', { id: 'company-delete' });
        setPendingDeletion(null);
      },
      onError: (error) => {
        toast.error(error.message, { id: 'company-delete' });
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Empresas" subtitle="Organizações parceiras cadastradas.">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="h-7 px-2.5">
            {query.isPending ? '—' : `${total} no total`}
          </Badge>

          <Button size="lg" onClick={openCreate}>
            <Plus className="size-4" />
            Nova empresa
          </Button>
        </div>
      </PageHeading>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-1.5 sm:max-w-xs">
            <Label htmlFor="company-search" className="text-xs text-muted-foreground">
              Buscar por nome
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="company-search"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Nome da empresa"
                className="h-9 pl-8"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Nome</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Criada em</TableHead>
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

              {query.isSuccess && companies.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={COLUMNS}
                    className="py-10 text-center text-sm whitespace-normal text-muted-foreground"
                  >
                    {search === ''
                      ? 'Nenhuma empresa cadastrada.'
                      : `Nenhuma empresa encontrada para "${search}".`}
                  </TableCell>
                </TableRow>
              )}

              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="pl-4 font-medium text-title">{company.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {company.address}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{company.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(company.createdAt)}
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(company)}
                        title="Editar"
                        aria-label={`Editar ${company.name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setPendingDeletion(company)}
                        title="Excluir"
                        aria-label={`Excluir ${company.name}`}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
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

      <CompanyFormDialog open={formOpen} onOpenChange={setFormOpen} company={editing} />

      <Dialog
        open={pendingDeletion !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeletion(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir empresa</DialogTitle>
            <DialogDescription>
              {`"${pendingDeletion?.name ?? ''}" será removida permanentemente. Esta ação não pode ser desfeita.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setPendingDeletion(null)}
              disabled={deleteCompany.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onClick={confirmDeletion}
              disabled={deleteCompany.isPending}
            >
              {deleteCompany.isPending ? 'Excluindo…' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
