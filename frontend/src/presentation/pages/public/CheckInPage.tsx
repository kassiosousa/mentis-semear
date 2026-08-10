import { useState, type ComponentProps } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { NotFoundError } from '@/domain/shared/errors/AppError';
import { isValidCpf } from '@/domain/shared/validation/cpf';
import type { CheckInInput } from '@/domain/workshop/repositories/PublicWorkshopRepository';
import { maskCpf, maskDate, maskPhone, onlyDigits, toIsoDate } from '@/lib/masks';
import { Button } from '@/presentation/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import { Checkbox } from '@/presentation/components/ui/checkbox';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { usePublicWorkshop, useRegisterCheckIn } from '@/presentation/hooks/usePublicWorkshop';
import { describeError, toFormErrors } from '@/presentation/pages/public/publicErrors';
import {
  InvalidLinkNotice,
  PublicShell,
  SuccessPanel,
  WorkshopSummary,
} from '@/presentation/pages/public/PublicShell';
import { checkInRoute } from '@/presentation/routes/modules/public.routes';

const TOAST_ID = 'public-check-in';
const GENDER_OTHER = 'outro';
const GENDER_OPTIONS = ['Masculino', 'Feminino', 'Prefiro não informar'];

const FIELD_BY_API: Record<string, string> = {
  workshop_id: 'workshopId',
  name: 'name',
  position: 'position',
  sector: 'sector',
  lgpd_read: 'lgpdRead',
  cpf: 'cpf',
  birthday: 'birthday',
  gender: 'gender',
  celphone: 'celphone',
  email: 'email',
};

const MESSAGE_BY_API: Record<string, string> = {
  cpf: 'Este CPF já registrou check-in nesta oficina.',
  workshop_id: 'Este link não aponta para uma oficina válida.',
};

const schema = z.object({
  name: z.string().min(3, 'Informe seu nome completo.').max(255, 'Máximo de 255 caracteres.'),
  cpf: z.string().refine(isValidCpf, 'Informe um CPF válido.'),
  birthday: z
    .string()
    .min(1, 'Informe uma data válida no formato dd/mm/aaaa.')
    .refine((value) => new Date(value) <= new Date(), 'A data de nascimento não pode ser futura.'),
  gender: z.string().min(1, 'Selecione uma opção.').max(30, 'Máximo de 30 caracteres.'),
  celphone: z.string().regex(/^\d{10,11}$/, 'Informe um celular válido com DDD.'),
  email: z.union([z.literal(''), z.email('Informe um e-mail válido.')]),
  position: z.string().min(1, 'Informe seu cargo.').max(255, 'Máximo de 255 caracteres.'),
  sector: z.string().min(1, 'Informe seu setor.').max(255, 'Máximo de 255 caracteres.'),
  lgpdRead: z
    .boolean()
    .refine((accepted) => accepted, 'É necessário aceitar para concluir o check-in.'),
});

interface FormValues {
  name: string;
  cpf: string;
  birthday: string;
  gender: string;
  genderOther: string;
  celphone: string;
  email: string;
  position: string;
  sector: string;
  lgpdRead: boolean;
}

const EMPTY: FormValues = {
  name: '',
  cpf: '',
  birthday: '',
  gender: '',
  genderOther: '',
  celphone: '',
  email: '',
  position: '',
  sector: '',
  lgpdRead: false,
};

export function CheckInPage() {
  const { token } = checkInRoute.useParams();

  const workshop = usePublicWorkshop(token);
  const registerCheckIn = useRegisterCheckIn();

  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const setField = <Field extends keyof FormValues>(field: Field, value: FormValues[Field]) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();

    if (workshop.data === undefined) return;

    const candidate = {
      name: values.name.trim(),
      cpf: onlyDigits(values.cpf),
      birthday: toIsoDate(values.birthday),
      gender: values.gender === GENDER_OTHER ? values.genderOther.trim() : values.gender,
      celphone: onlyDigits(values.celphone),
      email: values.email.trim(),
      position: values.position.trim(),
      sector: values.sector.trim(),
      lgpdRead: values.lgpdRead,
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

    const input: CheckInInput = {
      workshopId: workshop.data.id,
      name: candidate.name,
      position: candidate.position,
      sector: candidate.sector,
      cpf: candidate.cpf,
      birthday: candidate.birthday,
      gender: candidate.gender,
      celphone: candidate.celphone,
      email: candidate.email === '' ? null : candidate.email,
      lgpdRead: true,
    };

    registerCheckIn.mutate(input, {
      onSuccess: () => {
        setDone(true);
        window.scrollTo({ top: 0 });
      },
      onError: (error) => {
        setErrors(toFormErrors(error, FIELD_BY_API, MESSAGE_BY_API));
        toast.error(describeError(error), { id: TOAST_ID });
      },
    });
  };

  if (workshop.isError) {
    const missing = workshop.error instanceof NotFoundError;

    return (
      <PublicShell>
        <InvalidLinkNotice
          title={missing ? 'Link inválido' : 'Não foi possível carregar'}
          description={
            missing
              ? 'Este link de check-in não existe ou foi desativado. Peça um novo link a quem está aplicando a oficina.'
              : describeError(workshop.error)
          }
          onRetry={missing ? undefined : () => void workshop.refetch()}
        />
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <WorkshopSummary workshop={workshop.data} pending={workshop.isPending} />

      {done ? (
        <SuccessPanel
          title="Check-in confirmado!"
          description="Sua presença foi registrada. Bom encontro e obrigado por participar."
        />
      ) : (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Check-in do participante</CardTitle>
            <CardDescription>
              Preencha seus dados para confirmar a presença nesta oficina.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="checkin-name">Nome completo</Label>
                <Input
                  id="checkin-name"
                  value={values.name}
                  onChange={(event) => setField('name', event.target.value)}
                  aria-invalid={errors.name !== undefined}
                  autoComplete="name"
                  placeholder="Seu nome"
                  className="h-11"
                />
                {errors.name !== undefined && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="checkin-cpf">CPF</Label>
                  <Input
                    id="checkin-cpf"
                    value={values.cpf}
                    onChange={(event) => setField('cpf', maskCpf(event.target.value))}
                    aria-invalid={errors.cpf !== undefined}
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    className="h-11"
                  />
                  {errors.cpf !== undefined && (
                    <p className="text-xs text-destructive">{errors.cpf}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="checkin-birthday">Data de nascimento</Label>
                  <Input
                    id="checkin-birthday"
                    value={values.birthday}
                    onChange={(event) => setField('birthday', maskDate(event.target.value))}
                    aria-invalid={errors.birthday !== undefined}
                    inputMode="numeric"
                    placeholder="dd/mm/aaaa"
                    className="h-11"
                  />
                  {errors.birthday !== undefined && (
                    <p className="text-xs text-destructive">{errors.birthday}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="checkin-gender">Gênero</Label>
                  <Select
                    value={values.gender}
                    onValueChange={(value) => setField('gender', value)}
                  >
                    <SelectTrigger
                      id="checkin-gender"
                      className="h-11 w-full"
                      aria-invalid={errors.gender !== undefined}
                    >
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                      <SelectItem value={GENDER_OTHER}>Outro</SelectItem>
                    </SelectContent>
                  </Select>

                  {values.gender === GENDER_OTHER && (
                    <Input
                      value={values.genderOther}
                      onChange={(event) => setField('genderOther', event.target.value)}
                      aria-invalid={errors.gender !== undefined}
                      aria-label="Especifique o gênero"
                      maxLength={30}
                      placeholder="Como você se identifica"
                      className="h-11"
                    />
                  )}

                  {errors.gender !== undefined && (
                    <p className="text-xs text-destructive">{errors.gender}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="checkin-celphone">Celular</Label>
                  <Input
                    id="checkin-celphone"
                    value={values.celphone}
                    onChange={(event) => setField('celphone', maskPhone(event.target.value))}
                    aria-invalid={errors.celphone !== undefined}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(00) 00000-0000"
                    className="h-11"
                  />
                  {errors.celphone !== undefined && (
                    <p className="text-xs text-destructive">{errors.celphone}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="checkin-email">
                  E-mail <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <Input
                  id="checkin-email"
                  type="email"
                  value={values.email}
                  onChange={(event) => setField('email', event.target.value)}
                  aria-invalid={errors.email !== undefined}
                  autoComplete="email"
                  placeholder="voce@email.com"
                  className="h-11"
                />
                {errors.email !== undefined && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="checkin-position">Cargo</Label>
                  <Input
                    id="checkin-position"
                    value={values.position}
                    onChange={(event) => setField('position', event.target.value)}
                    aria-invalid={errors.position !== undefined}
                    placeholder="Analista"
                    className="h-11"
                  />
                  {errors.position !== undefined && (
                    <p className="text-xs text-destructive">{errors.position}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="checkin-sector">Setor</Label>
                  <Input
                    id="checkin-sector"
                    value={values.sector}
                    onChange={(event) => setField('sector', event.target.value)}
                    aria-invalid={errors.sector !== undefined}
                    placeholder="Operações"
                    className="h-11"
                  />
                  {errors.sector !== undefined && (
                    <p className="text-xs text-destructive">{errors.sector}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-primary p-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="checkin-lgpd"
                    checked={values.lgpdRead}
                    onCheckedChange={(checked) => setField('lgpdRead', checked === true)}
                    aria-invalid={errors.lgpdRead !== undefined}
                    className="mt-0.5"
                  />
                  <Label htmlFor="checkin-lgpd" className="text-xs leading-relaxed font-normal">
                    Autorizo o tratamento dos dados informados neste formulário para registrar
                    minha presença e gerar indicadores da oficina, conforme a Lei nº 13.709/2018
                    (LGPD). Posso solicitar a exclusão dos meus dados a qualquer momento.
                  </Label>
                </div>

                {errors.lgpdRead !== undefined && (
                  <p className="text-xs text-destructive">{errors.lgpdRead}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-11 w-full"
                disabled={registerCheckIn.isPending || workshop.data === undefined}
              >
                {registerCheckIn.isPending ? 'Enviando…' : 'Confirmar check-in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </PublicShell>
  );
}
