import { toast } from 'sonner';
import type { Sector } from '@/domain/sector/entities/Sector';
import { Button } from '@/presentation/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { useDeleteSector } from '@/presentation/hooks/useSectors';

interface SectorDeleteDialogProps {
  sector: Sector | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function SectorDeleteDialog({ sector, onOpenChange, onDeleted }: SectorDeleteDialogProps) {
  const deleteSector = useDeleteSector();

  const confirm = () => {
    if (sector === null) return;

    deleteSector.mutate(sector.id, {
      onSuccess: () => {
        toast.success('Setor excluído.', { id: 'sector-delete' });
        onOpenChange(false);
        onDeleted?.();
      },
      onError: (error) => {
        toast.error(error.message, { id: 'sector-delete' });
      },
    });
  };

  return (
    <Dialog
      open={sector !== null}
      onOpenChange={(open) => {
        if (!open) onOpenChange(false);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir setor</DialogTitle>
          <DialogDescription>
            {`"${sector?.name ?? ''}" será removido permanentemente. As respostas do termômetro e os check-ins vinculados ficam sem setor. Esta ação não pode ser desfeita.`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            size="lg"
            onClick={() => onOpenChange(false)}
            disabled={deleteSector.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            size="lg"
            onClick={confirm}
            disabled={deleteSector.isPending}
          >
            {deleteSector.isPending ? 'Excluindo…' : 'Excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
