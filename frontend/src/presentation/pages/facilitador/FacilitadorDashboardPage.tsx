import { CalendarCheck, CalendarClock, ChevronLeft, ChevronRight, Plus, Sprout } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { isPast, type Workshop } from '@/domain/workshop/entities/Workshop';
import { StatCard } from '@/presentation/components/dashboard/panels';
import { PageHeading } from '@/presentation/components/layout/PageHeading';
import { Button } from '@/presentation/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { QrCodeDialog, type QrTarget } from '@/presentation/components/ui/qr-code-dialog';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import { useDirectory } from '@/presentation/hooks/useDirectory';
import { useCurrentUser } from '@/presentation/hooks/useSession';
import { useDeleteWorkshop, useWorkshops } from '@/presentation/hooks/useWorkshops';
import { WorkshopCard } from '@/presentation/pages/facilitador/WorkshopCard';
import { WorkshopDetailDialog } from '@/presentation/pages/facilitador/WorkshopDetailDialog';
import { WorkshopFormDialog } from '@/presentation/pages/facilitador/WorkshopFormDialog';

export function FacilitadorDashboardPage() {
  const user = useCurrentUser();
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<Workshop | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<Workshop | null>(null);
  const [detail, setDetail] = useState<Workshop | null>(null);
  const [qrTarget, setQrTarget] = useState<QrTarget | null>(null);

  const directory = useDirectory({ facilitators: false });
  const query = useWorkshops({ page });
  const deleteWorkshop = useDeleteWorkshop();

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

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (workshop: Workshop) => {
    setDetail(null);
    setEditing(workshop);
    setFormOpen(true);
  };

  const showQr = (label: string, url: string, workshopId: number) => {
    setQrTarget({
      title: `QR Code — ${label}`,
      description: `Oficina #${workshopId}. Aponte a câmera para acessar o formulário.`,
      url,
      fileName: `oficina-${workshopId}-${label.toLowerCase().replace(/\W+/g, '-')}`,
    });
  };

  const confirmDeletion = () => {
    if (pendingDeletion === null) return;

    deleteWorkshop.mutate(pendingDeletion.id, {
      onSuccess: () => {
        toast.success('Oficina excluída.', { id: 'facilitador-workshop-delete' });
        setPendingDeletion(null);
      },
      onError: (error) => {
        toast.error(error.message, { id: 'facilitador-workshop-delete' });
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Painel do Facilitador" subtitle={`Bem-vindo, ${user?.name ?? ''}.`}>
        <Button size="lg" onClick={openCreate}>
          <Plus className="size-4" />
          Nova oficina
        </Button>
      </PageHeading>

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
              <Skeleton key={index} className="h-72 w-full rounded-xl" />
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
            <Button className="mt-4" onClick={openCreate}>
              <Plus className="size-4" />
              Nova oficina
            </Button>
          </div>
        )}

        {mine.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mine.map((workshop) => (
              <WorkshopCard
                key={workshop.id}
                workshop={workshop}
                companyName={directory.companyName(workshop.companyId)}
                onOpen={setDetail}
                onEdit={openEdit}
                onDelete={setPendingDeletion}
                onShowQr={showQr}
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

      <WorkshopDetailDialog
        workshop={detail}
        companyName={detail === null ? '' : directory.companyName(detail.companyId)}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
        onEdit={openEdit}
        onShowQr={showQr}
      />

      <QrCodeDialog
        target={qrTarget}
        onOpenChange={(open) => {
          if (!open) setQrTarget(null);
        }}
      />

      <WorkshopFormDialog open={formOpen} onOpenChange={setFormOpen} workshop={editing} />

      <Dialog
        open={pendingDeletion !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeletion(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir oficina</DialogTitle>
            <DialogDescription>
              {`A oficina #${pendingDeletion?.id ?? ''} será removida permanentemente. Esta ação não pode ser desfeita.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setPendingDeletion(null)}
              disabled={deleteWorkshop.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onClick={confirmDeletion}
              disabled={deleteWorkshop.isPending}
            >
              {deleteWorkshop.isPending ? 'Excluindo…' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
