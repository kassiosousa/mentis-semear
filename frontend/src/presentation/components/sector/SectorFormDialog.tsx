import { useEffect, useState, type ComponentProps } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import type { Company } from '@/domain/company/entities/Company';
import type { Sector, SectorInput } from '@/domain/sector/entities/Sector';
import { ValidationError } from '@/domain/shared/errors/AppError';
import type { SectorScope } from '@/presentation/components/sector/SectorLink';
import { Button } from '@/presentation/components/ui/button';
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
import { useCreateSector, useUpdateSector } from '@/presentation/hooks/useSectors';

const schema = z.object({
  name: z.string().min(1, 'Informe o nome.'),
});

interface FormValues {
  name: string;
  companyId: string;
}

const EMPTY: FormValues = { name: '', companyId: '' };

interface SectorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sector: Sector | null;
  scope: SectorScope;
  companies?: Company[];
}

export function SectorFormDialog({
  open,
  onOpenChange,
  sector,
  scope,
  companies = [],
}: SectorFormDialogProps) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createSector = useCreateSector();
  const updateSector = useUpdateSector();
  const editing = sector !== null;
  const pending = createSector.isPending || updateSector.isPending;
  const choosesCompany = scope === 'admin' && !editing;

  useEffect(() => {
    if (!open) return;

    setValues(
      sector === null ? EMPTY : { name: sector.name, companyId: String(sector.companyId) },
    );
    setErrors({});
  }, [open, sector]);

  const onError = (error: Error) => {
    if (error instanceof ValidationError) {
      const fields: Record<string, string> = {};
      for (const [field, messages] of Object.entries(error.fields)) {
        if (messages[0] !== undefined) fields[field] = messages[0];
      }
      setErrors(fields);
    }

    toast.error(error.message, { id: 'sector-form' });
  };

  const onSuccess = () => {
    toast.success(editing ? 'Setor atualizado.' : 'Setor criado.', { id: 'sector-form' });
    onOpenChange(false);
  };

  const onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();

    const name = values.name.trim();
    const next: Record<string, string> = {};
    const parsed = schema.safeParse({ name });

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0]);
        next[field] ??= issue.message;
      }
    }

    if (choosesCompany && values.companyId === '') {
      next.company_id = 'Selecione a empresa.';
    }

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setErrors({});

    if (sector === null) {
      const input: SectorInput = { name };
      if (scope === 'admin') input.companyId = Number(values.companyId);

      createSector.mutate(input, { onSuccess, onError });
      return;
    }

    updateSector.mutate({ id: sector.id, input: { name } }, { onSuccess, onError });
  };

  const companyLabel =
    sector === null
      ? ''
      : (companies.find((company) => company.id === sector.companyId)?.name ??
        `Empresa #${sector.companyId}`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar setor' : 'Novo setor'}</DialogTitle>
          <DialogDescription>
            {editing
              ? 'Atualize o nome do setor. A empresa vinculada não pode ser alterada.'
              : scope === 'admin'
                ? 'Cadastre um setor e vincule-o a uma empresa.'
                : 'Cadastre um setor da sua empresa.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {choosesCompany && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="sector-company">Empresa</Label>
              <Select
                value={values.companyId}
                onValueChange={(value) =>
                  setValues((current) => ({ ...current, companyId: value }))
                }
              >
                <SelectTrigger
                  id="sector-company"
                  className="h-10"
                  aria-invalid={errors.company_id !== undefined}
                >
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={String(company.id)}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.company_id !== undefined && (
                <p className="text-xs text-destructive">{errors.company_id}</p>
              )}
            </div>
          )}

          {scope === 'admin' && editing && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="sector-company-readonly">Empresa</Label>
              <Input id="sector-company-readonly" value={companyLabel} className="h-10" disabled />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="sector-name">Nome</Label>
            <Input
              id="sector-name"
              value={values.name}
              onChange={(event) =>
                setValues((current) => ({ ...current, name: event.target.value }))
              }
              aria-invalid={errors.name !== undefined}
              placeholder="Ex.: Recursos Humanos"
              className="h-10"
              autoFocus
            />
            {errors.name !== undefined && <p className="text-xs text-destructive">{errors.name}</p>}
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
