import { CalendarCheck, CalendarClock, ChevronLeft, ChevronRight, Sprout } from 'lucide-react';
import { useMemo, useState } from 'react';
import { isPast } from '@/domain/workshop/entities/Workshop';
import { StatCard } from '@/presentation/components/dashboard/panels';
import { PageHeading } from '@/presentation/components/layout/PageHeading';
import { Button } from '@/presentation/components/ui/button';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import { useDirectory } from '@/presentation/hooks/useDirectory';
import { useCurrentUser } from '@/presentation/hooks/useSession';
import { useWorkshops } from '@/presentation/hooks/useWorkshops';
import { WorkshopCard } from '@/presentation/pages/facilitador/WorkshopCard';

export function FacilitadorDashboardPage() {
  const user = useCurrentUser();
  const [page, setPage] = useState(1);

  const directory = useDirectory({ facilitators: false });
  const query = useWorkshops({ page });

  const mine = useMemo(() => {
    const all = query.data?.workshops ?? [];
    if (user === null) return [];

    return all
      .filter((workshop) => workshop.facilitatorId === user.id)
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
  }, [query.data, user]);

  const upcoming = useMemo(() => mine.filter((workshop) => !isPast(workshop)), [mine]);
  const past = useMemo(() => mine.filter((workshop) => isPast(workshop)), [mine]);

  const perPage = query.data?.perPage ?? 0;
  const total = query.data?.total ?? 0;
  const currentPage = query.data?.currentPage ?? page;
  const lastPage = perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Painel do Facilitador" subtitle={`Bem-vindo, ${user?.name ?? ''}.`} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Minhas oficinas"
          value={query.isPending ? '—' : String(mine.length)}
          icon={Sprout}
        />
        <StatCard
          label="Próximas"
          value={query.isPending ? '—' : String(upcoming.length)}
          icon={CalendarClock}
        />
        <StatCard
          label="Realizadas"
          value={query.isPending ? '—' : String(past.length)}
          icon={CalendarCheck}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">Minhas oficinas</h2>
          {lastPage > 1 && (
            <span className="text-xs text-muted-foreground">
              Página {currentPage} de {lastPage}
            </span>
          )}
        </div>

        {query.isPending && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        )}

        {query.isError && (
          <div className="rounded-xl border border-dashed border-destructive/40 px-4 py-14 text-center">
            <p className="text-sm text-destructive">{query.error.message}</p>
          </div>
        )}

        {query.isSuccess && mine.length === 0 && (
          <div className="rounded-xl border border-dashed border-border px-4 py-14 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma oficina atribuída a você nesta página.
            </p>
          </div>
        )}

        {mine.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mine.map((workshop) => (
              <WorkshopCard
                key={workshop.id}
                workshop={workshop}
                companyName={directory.companyName(workshop.companyId)}
              />
            ))}
          </div>
        )}

        {lastPage > 1 && (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage <= 1 || query.isFetching}
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>
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
        )}
      </div>
    </div>
  );
}
