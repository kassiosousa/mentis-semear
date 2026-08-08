import { useEffect, useState, type ComponentProps } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import type { Company, CompanyInput } from '@/domain/company/entities/Company';
import { ValidationError } from '@/domain/shared/errors/AppError';
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
import { useCreateCompany, useUpdateCompany } from '@/presentation/hooks/useCompanies';

const schema = z.object({
  name: z.string().min(1, 'Informe o nome.'),
  address: z.string().min(1, 'Informe o endereço.'),
  email: z.email('E-mail inválido.'),
});

const EMPTY: CompanyInput = { name: '', address: '', email: '' };

interface CompanyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
}

export function CompanyFormDialog({ open, onOpenChange, company }: CompanyFormDialogProps) {
  const [values, setValues] = useState<CompanyInput>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const editing = company !== null;
  const pending = createCompany.isPending || updateCompany.isPending;

  useEffect(() => {
    if (!open) return;

    setValues(
      company === null
        ? EMPTY
        : { name: company.name, address: company.address, email: company.email },
    );
    setErrors({});
  }, [open, company]);

  const setField = (field: keyof CompanyInput) => (event: { target: { value: string } }) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
  };

  const onError = (error: Error) => {
    if (error instanceof ValidationError) {
      const fields: Record<string, string> = {};
      for (const [field, messages] of Object.entries(error.fields)) {
        if (messages[0] !== undefined) fields[field] = messages[0];
      }
      setErrors(fields);
    }

    toast.error(error.message, { id: 'company-form' });
  };

  const onSuccess = () => {
    toast.success(editing ? 'Empresa atualizada.' : 'Empresa criada.', { id: 'company-form' });
    onOpenChange(false);
  };

  const onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();

    const input: CompanyInput = {
      name: values.name.trim(),
      address: values.address.trim(),
      email: values.email.trim(),
    };

    const parsed = schema.safeParse(input);

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

    if (company === null) {
      createCompany.mutate(input, { onSuccess, onError });
      return;
    }

    updateCompany.mutate({ id: company.id, input }, { onSuccess, onError });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar empresa' : 'Nova empresa'}</DialogTitle>
          <DialogDescription>
            {editing
              ? 'Atualize os dados da organização parceira.'
              : 'Cadastre uma nova organização parceira.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="company-name">Nome</Label>
            <Input
              id="company-name"
              value={values.name}
              onChange={setField('name')}
              aria-invalid={errors.name !== undefined}
              className="h-10"
              autoFocus
            />
            {errors.name !== undefined && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="company-address">Endereço</Label>
            <Input
              id="company-address"
              value={values.address}
              onChange={setField('address')}
              aria-invalid={errors.address !== undefined}
              className="h-10"
            />
            {errors.address !== undefined && (
              <p className="text-xs text-destructive">{errors.address}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="company-email">E-mail</Label>
            <Input
              id="company-email"
              type="email"
              value={values.email}
              onChange={setField('email')}
              aria-invalid={errors.email !== undefined}
              className="h-10"
            />
            {errors.email !== undefined && (
              <p className="text-xs text-destructive">{errors.email}</p>
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
