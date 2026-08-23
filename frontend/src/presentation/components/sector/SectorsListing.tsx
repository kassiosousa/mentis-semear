import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Company } from '@/domain/company/entities/Company';
import { moodOfSector } from '@/domain/mood/entities/MoodSummary';
import type { Sector } from '@/domain/sector/entities/Sector';
import { matchesTerm } from '@/domain/sector/entities/Sector';
import { PageHeading } from '@/presentation/components/layout/PageHeading';
import { SectorCard } from '@/presentation/components/sector/SectorCard';
import { SectorDeleteDialog } from '@/presentation/components/sector/SectorDeleteDialog';
import { SectorFormDialog } from '@/presentation/components/sector/SectorFormDialog';
import type { SectorScope } from '@/presentation/components/sector/SectorLink';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import { useMoodSummary } from '@/presentation/hooks/useMoodSummary';
import { useSectors } from '@/presentation/hooks/useSectors';

interface SectorsListingProps {
  scope: SectorScope;
  companyId?: number;
  companyName?: (id: number) => string;
  companies?: Company[];
}

export function SectorsListing({
  scope,
  companyId,
  companyName,
  companies,
}: SectorsListingProps) {
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Sector | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<Sector | null>(null);

  const query = useSectors({ companyId, page });
  const moods = useMoodSummary({ companyId });

  const sectors = useMemo(() => query.data?.sectors ?? [], [query.data]);
  const visible = useMemo(
    () => sectors.filter((sector) => matchesTerm(sector, term)),
    [sectors, term],
  );

  const total = query.data?.total ?? 0;
  const perPage = query.data?.perPage ?? 0;
  const currentPage = query.data?.currentPage ?? page;
  const lastPage = perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1;
  const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);
  const filtering = term.trim() !== '';

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (sector: Sector) => {
    setEditing(sector);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Setores"
        subtitle={
          scope === 'admin'
            ? 'Setores cadastrados em todas as empresas.'
            : 'Setores cadastrados na sua empresa.'
        }
      >
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="h-7 px-2.5">
            {query.isPending ? '—' : `${total} no total`}
          </Badge>

          <Button size="lg" onClick={openCreate}>
            <Plus className="size-4" />
            Novo setor
          </Button>
        </div>
      </PageHeading>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-1.5 sm:max-w-xs">
            <Label htmlFor="sector-search" className="text-xs text-muted-foreground">
              Buscar por nome
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="sector-search"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Nome do setor"
                className="h-9 pl-8"
              />
            </div>
            {filtering && lastPage > 1 && (
              <p className="text-[11px] text-muted-foreground">
                A busca ainda filtra apenas os setores desta página.
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {query.isPending && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          )}

          {query.isError && (
            <p className="py-10 text-center text-sm text-destructive">{query.error.message}</p>
          )}

          {query.isSuccess && visible.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {filtering
                ? `Nenhum setor encontrado para "${term.trim()}".`
                : 'Nenhum setor cadastrado.'}
            </p>
          )}

          {visible.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((sector) => (
                <SectorCard
                  key={sector.id}
                  sector={sector}
                  scope={scope}
                  companyName={companyName?.(sector.companyId)}
                  mood={moodOfSector(moods.data, sector.id)}
                  onEdit={openEdit}
                  onDelete={setPendingDeletion}
                />
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-muted-foreground">
            {total === 0
              ? 'Nenhum registro'
              : filtering
                ? `${visible.length} de ${sectors.length} nesta página`
                : `Mostrando ${from}–${to} de ${total}`}
          </span>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
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

      <SectorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        sector={editing}
        scope={scope}
        companies={companies}
      />

      <SectorDeleteDialog
        sector={pendingDeletion}
        onOpenChange={(open) => {
          if (!open) setPendingDeletion(null);
        }}
      />
    </div>
  );
}
