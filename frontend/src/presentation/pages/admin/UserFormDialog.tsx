import { useEffect, useState, type ComponentProps } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import type { User, UserType } from '@/domain/auth/entities/User';
import { ASSIGNABLE_USER_TYPES, isUserType, labelOfType } from '@/domain/auth/entities/User';
import { ValidationError } from '@/domain/shared/errors/AppError';
import type { CreateUserInput, UpdateUserInput } from '@/domain/user/repositories/UserRepository';
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
import { useDirectory } from '@/presentation/hooks/useDirectory';
import { useCreateUser, useUpdateUser } from '@/presentation/hooks/useUsers';

const MIN_PASSWORD = 8;

const FIELD_BY_API: Record<string, string> = { company_id: 'companyId' };

const identity = z.object({
  name: z.string().min(1, 'Informe o nome.'),
  email: z.email('E-mail inválido.'),
});

interface FormValues {
  name: string;
  email: string;
  password: string;
  type: UserType | '';
  companyId: string;
}

const EMPTY: FormValues = { name: '', email: '', password: '', type: '', companyId: '' };

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const directory = useDirectory({ facilitators: false });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const editing = user !== null;
  const pending = createUser.isPending || updateUser.isPending;
  const typeOptions =
    user !== null && !ASSIGNABLE_USER_TYPES.includes(user.type)
      ? [...ASSIGNABLE_USER_TYPES, user.type]
      : ASSIGNABLE_USER_TYPES;

  useEffect(() => {
    if (!open) return;

    setValues(
      user === null
        ? EMPTY
        : {
            name: user.name,
            email: user.email,
            password: '',
            type: user.type,
            companyId: user.companyId === null ? '' : String(user.companyId),
          },
    );
    setErrors({});
  }, [open, user]);

  const setField = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const onError = (error: Error) => {
    if (error instanceof ValidationError) {
      const fields: Record<string, string> = {};
      for (const [field, messages] of Object.entries(error.fields)) {
        if (messages[0] !== undefined) fields[FIELD_BY_API[field] ?? field] = messages[0];
      }
      setErrors(fields);
    }

    toast.error(error.message, { id: 'user-form' });
  };

  const onSuccess = () => {
    toast.success(editing ? 'Usuário atualizado.' : 'Usuário criado.', { id: 'user-form' });
    onOpenChange(false);
  };

  const onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();

    const name = values.name.trim();
    const email = values.email.trim();
    const password = values.password;

    const next: Record<string, string> = {};
    const parsed = identity.safeParse({ name, email });

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0]);
        next[field] ??= issue.message;
      }
    }

    const passwordRequired = !editing;

    if (passwordRequired && password.length < MIN_PASSWORD) {
      next.password = `A senha precisa de pelo menos ${MIN_PASSWORD} caracteres.`;
    }

    if (!passwordRequired && password !== '' && password.length < MIN_PASSWORD) {
      next.password = `A senha precisa de pelo menos ${MIN_PASSWORD} caracteres.`;
    }

    const type = isUserType(values.type) ? values.type : null;

    if (type === null) {
      next.type = 'Selecione o perfil de acesso.';
    }

    const companyRequired = values.type === 'empresa';

    if (companyRequired && values.companyId === '') {
      next.companyId = 'Selecione a empresa deste usuário.';
    }

    if (type === null || Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setErrors({});

    const companyId = companyRequired ? Number(values.companyId) : null;

    if (user === null) {
      const input: CreateUserInput = { name, email, password, type, companyId };

      createUser.mutate(input, { onSuccess, onError });
      return;
    }

    const input: UpdateUserInput = { name, email, type, companyId };
    if (password !== '') input.password = password;

    updateUser.mutate({ id: user.id, input }, { onSuccess, onError });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar usuário' : 'Novo usuário'}</DialogTitle>
          <DialogDescription>
            {editing
              ? 'Atualize os dados da conta.'
              : 'Cadastre uma nova conta e defina o perfil de acesso.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="user-name">Nome</Label>
            <Input
              id="user-name"
              value={values.name}
              onChange={(event) => setField('name', event.target.value)}
              aria-invalid={errors.name !== undefined}
              className="h-10"
              autoFocus
            />
            {errors.name !== undefined && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="user-email">E-mail</Label>
            <Input
              id="user-email"
              type="email"
              autoComplete="off"
              value={values.email}
              onChange={(event) => setField('email', event.target.value)}
              aria-invalid={errors.email !== undefined}
              className="h-10"
            />
            {errors.email !== undefined && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="user-password">
              Senha {editing && <span className="text-muted-foreground">(opcional)</span>}
            </Label>
            <Input
              id="user-password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              onChange={(event) => setField('password', event.target.value)}
              aria-invalid={errors.password !== undefined}
              placeholder={editing ? 'Deixe em branco para manter a atual' : 'Mínimo 8 caracteres'}
              className="h-10"
            />
            {errors.password !== undefined && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="user-type">Perfil</Label>
            <Select
              value={values.type}
              onValueChange={(value) => {
                if (isUserType(value)) setValues((current) => ({ ...current, type: value }));
              }}
            >
              <SelectTrigger
                id="user-type"
                className="h-10"
                aria-invalid={errors.type !== undefined}
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((value) => (
                  <SelectItem key={value} value={value}>
                    {labelOfType(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type !== undefined && <p className="text-xs text-destructive">{errors.type}</p>}
          </div>

          {values.type === 'empresa' && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-company">Empresa</Label>
              <Select
                value={values.companyId}
                onValueChange={(value) => setField('companyId', value)}
              >
                <SelectTrigger
                  id="user-company"
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
              {errors.companyId === undefined ? (
                <p className="text-xs text-muted-foreground">
                  Contas do tipo Empresa precisam estar vinculadas a uma empresa.
                </p>
              ) : (
                <p className="text-xs text-destructive">{errors.companyId}</p>
              )}
            </div>
          )}

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
