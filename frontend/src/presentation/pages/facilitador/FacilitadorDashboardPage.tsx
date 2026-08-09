import { CalendarCheck, CalendarClock, Plus, Sprout } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
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
import { useCurrentUser } from '@/presentation/hooks/useSession';
import { WorkshopCard } from '@/presentation/pages/facilitador/WorkshopCard';
import { WorkshopFormDialog } from '@/presentation/pages/facilitador/WorkshopFormDialog';
import {
  isPastWorkshop,
  removeMockWorkshop,
  useMockWorkshops,
  type FacilitatorWorkshop,
} from '@/presentation/pages/facilitador/mockWorkshops';

export function FacilitadorDashboardPage() {
  const user = useCurrentUser();
  const workshops = useMockWorkshops();

  const [editing, setEditing] = useState<FacilitatorWorkshop | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<FacilitatorWorkshop | null>(null);

  const upcoming = useMemo(
    () => workshops.filter((workshop) => !isPastWorkshop(workshop)),
    [workshops],
  );

  const past = useMemo(
    () => workshops.filter((workshop) => isPastWorkshop(workshop)),
    [workshops],
  );

  const ordered = useMemo(
    () =>
      [...workshops].sort(
        (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
      ),
    [workshops],
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (workshop: FacilitatorWorkshop) => {
    setEditing(workshop);
    setFormOpen(true);
  };

  const confirmDeletion = () => {
    if (pendingDeletion === null) return;

    removeMockWorkshop(pendingDeletion.id);
    toast.success('Oficina excluída.', { id: 'facilitador-workshop-delete' });
    setPendingDeletion(null);
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
        <StatCard label="Minhas oficinas" value={String(workshops.length)} icon={Sprout} />
        <StatCard label="Próximas" value={String(upcoming.length)} icon={CalendarClock} />
        <StatCard label="Realizadas" value={String(past.length)} icon={CalendarCheck} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">Minhas oficinas</h2>
          <span className="text-xs text-muted-foreground">
            {workshops.length === 0
              ? 'Nenhuma oficina'
              : `${workshops.length} no total, ${upcoming.length} agendada(s)`}
          </span>
        </div>

        {workshops.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-14 text-center">
            <p className="text-sm text-muted-foreground">
              Você ainda não tem oficinas. Crie a primeira para começar.
            </p>
            <Button className="mt-4" onClick={openCreate}>
              <Plus className="size-4" />
              Nova oficina
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ordered.map((workshop) => (
              <WorkshopCard
                key={workshop.id}
                workshop={workshop}
                onEdit={openEdit}
                onDelete={setPendingDeletion}
              />
            ))}
          </div>
        )}
      </div>

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
              {`A oficina #${pendingDeletion?.id ?? ''} será removida. Esta ação não pode ser desfeita.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" size="lg" onClick={() => setPendingDeletion(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" size="lg" onClick={confirmDeletion}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
