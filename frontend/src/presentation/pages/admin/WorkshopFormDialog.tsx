import { useEffect, useState, type ComponentProps } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { ValidationError } from '@/domain/shared/errors/AppError';
import type { Workshop } from '@/domain/workshop/entities/Workshop';
import type { WorkshopInput } from '@/domain/workshop/repositories/WorkshopRepository';
import { Button } from '@/presentation/components/ui/button';
import { DateTimePicker } from '@/presentation/components/ui/date-time-picker';
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
import { useDirectory } from '@/presentation/hooks/useDirectory';
import { useCreateWorkshop, useUpdateWorkshop } from '@/presentation/hooks/useWorkshops';

const NO_FACILITATOR = 'nenhum';

const schema = z.object({
  companyId: z.string().min(1, 'Selecione a empresa.'),
  datetime: z.string().min(1, 'Informe a data e a hora.'),
  address: z.string().min(1, 'Informe o local.'),
});

interface FormValues {
  companyId: string;
  facilitatorId: string;
  datetime: string;
  address: string;
}

const EMPTY: FormValues = {
  companyId: '',
  facilitatorId: NO_FACILITATOR,
  datetime: '',
  address: '',
};

function toLocalInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const offset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toIso(local: string): string {
  const date = new Date(local);

  return Number.isNaN(date.getTime()) ? local : date.toISOString();
}

interface WorkshopFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workshop: Workshop | null;
}

export function WorkshopFormDialog({ open, onOpenChange, workshop }: WorkshopFormDialogProps) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const directory = useDirectory();
  const createWorkshop = useCreateWorkshop();
  const updateWorkshop = useUpdateWorkshop();
  const editing = workshop !== null;
  const pending = createWorkshop.isPending || updateWorkshop.isPending;

  useEffect(() => {
    if (!open) return;

    setValues(
      workshop === null
        ? EMPTY
        : {
            companyId: String(workshop.companyId),
            facilitatorId: workshop.facilitatorId ?? NO_FACILITATOR,
            datetime: toLocalInput(workshop.datetime),
            address: workshop.address,
          },
    );
    setErrors({});
  }, [open, workshop]);

  const setField = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const onError = (error: Error) => {
    if (error instanceof ValidationError) {
      const fields: Record<string, string> = {};
      for (const [field, messages] of Object.entries(error.fields)) {
        if (messages[0] !== undefined) fields[field] = messages[0];
      }
      setErrors(fields);
    }

    toast.error(error.message, { id: 'workshop-form' });
  };

  const onSuccess = () => {
    toast.success(editing ? 'Oficina atualizada.' : 'Oficina criada.', { id: 'workshop-form' });
    onOpenChange(false);
  };

  const onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();

    const candidate = {
      companyId: values.companyId,
      datetime: values.datetime,
      address: values.address.trim(),
    };

    const parsed = schema.safeParse(candidate);

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0]);
        next[field] ??= issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});

    const input: WorkshopInput = {
      companyId: Number(candidate.companyId),
      facilitatorId: values.facilitatorId === NO_FACILITATOR ? null : values.facilitatorId,
      datetime: toIso(candidate.datetime),
      address: candidate.address,
    };

    if (workshop === null) {
      createWorkshop.mutate(input, { onSuccess, onError });
      return;
    }

    updateWorkshop.mutate({ id: workshop.id, input }, { onSuccess, onError });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? `Editar oficina #${workshop.id}` : 'Nova oficina'}</DialogTitle>
          <DialogDescription>
            {editing ? 'Atualize os dados do encontro.' : 'Agende um novo encontro.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="workshop-company">Empresa</Label>
              <Select
                value={values.companyId}
                onValueChange={(value) => setField('companyId', value)}
              >
                <SelectTrigger
                  id="workshop-company"
                  className="h-10"
                  aria-invalid={errors.companyId !== undefined}
                >
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {directory.companies.map((company) => (
                    <SelectItem key={company.id} value={String(company.id)}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.companyId !== undefined && (
                <p className="text-xs text-destructive">{errors.companyId}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="workshop-facilitator">
                Aplicador <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Select
                value={values.facilitatorId}
                onValueChange={(value) => setField('facilitatorId', value)}
              >
                <SelectTrigger id="workshop-facilitator" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_FACILITATOR}>Não atribuído</SelectItem>
                  {directory.facilitators.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="workshop-datetime">Data e hora</Label>
            <DateTimePicker
              id="workshop-datetime"
              value={values.datetime}
              onChange={(next) => setField('datetime', next)}
              invalid={errors.datetime !== undefined}
            />
            {errors.datetime !== undefined && (
              <p className="text-xs text-destructive">{errors.datetime}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="workshop-address">Local</Label>
            <Input
              id="workshop-address"
              value={values.address}
              onChange={(event) => setField('address', event.target.value)}
              aria-invalid={errors.address !== undefined}
              placeholder="Auditório - Matriz"
              className="h-10"
            />
            {errors.address !== undefined && (
              <p className="text-xs text-destructive">{errors.address}</p>
            )}
          </div>


          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? 'Salvando…' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
