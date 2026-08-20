import { useState, type ComponentProps } from 'react';
import { toast } from 'sonner';
import type { MoodScore } from '@/domain/mood/entities/MoodSummary';
import { moodLabel } from '@/domain/mood/entities/MoodSummary';
import type { MoodEntryInput } from '@/domain/mood/repositories/PublicMoodRepository';
import { NotFoundError } from '@/domain/shared/errors/AppError';
import { MoodPicker } from '@/presentation/components/mood/MoodPicker';
import { Button } from '@/presentation/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import { Label } from '@/presentation/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { Textarea } from '@/presentation/components/ui/textarea';
import { usePublicCompany, useRegisterMoodEntry } from '@/presentation/hooks/usePublicMood';
import { describeError, toFormErrors } from '@/presentation/pages/public/publicErrors';
import {
  CompanySummary,
  InvalidLinkNotice,
  PublicShell,
  SuccessPanel,
} from '@/presentation/pages/public/PublicShell';
import { thermometerRoute } from '@/presentation/routes/modules/public.routes';

const TOAST_ID = 'public-mood';
const MAX_DESCRIPTION = 1000;

const FIELD_BY_API: Record<string, string> = {
  company_id: 'company',
  sector_id: 'sectorId',
  mood: 'mood',
  description: 'description',
};

const MESSAGE_BY_API: Record<string, string> = {
  company_id: 'Este link não aponta para uma empresa válida.',
  sector_id: 'Selecione um setor válido para esta empresa.',
  mood: 'Escolha como você está se sentindo.',
  description: `Use no máximo ${MAX_DESCRIPTION} caracteres.`,
};

export function ThermometerPage() {
  const { token } = thermometerRoute.useParams();

  const company = usePublicCompany(token);
  const registerMood = useRegisterMoodEntry();

  const [sectorId, setSectorId] = useState('');
  const [mood, setMood] = useState<MoodScore | null>(null);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const sectors = company.data?.sectors ?? [];
  const withoutSectors = company.isSuccess && sectors.length === 0;

  const onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();

    if (company.data === undefined) return;

    const text = description.trim();
    const next: Record<string, string> = {};

    if (sectorId === '') next.sectorId = 'Selecione o seu setor.';
    if (mood === null) next.mood = 'Escolha como você está se sentindo.';
    if (text.length > MAX_DESCRIPTION) {
      next.description = `Use no máximo ${MAX_DESCRIPTION} caracteres.`;
    }

    if (mood === null || Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setErrors({});

    const input: MoodEntryInput = {
      companyId: company.data.id,
      sectorId: Number(sectorId),
      mood,
      description: text === '' ? null : text,
    };

    registerMood.mutate(input, {
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

  if (company.isError) {
    const missing = company.error instanceof NotFoundError;

    return (
      <PublicShell>
        <InvalidLinkNotice
          title={missing ? 'Link inválido' : 'Não foi possível carregar'}
          description={
            missing
              ? 'Este link do termômetro não existe ou foi desativado. Peça um novo link à sua empresa.'
              : describeError(company.error)
          }
          onRetry={missing ? undefined : () => void company.refetch()}
        />
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <CompanySummary
        company={company.data}
        pending={company.isPending}
        description="Termômetro emocional · resposta anônima"
      />

      {done ? (
        <SuccessPanel
          title="Resposta registrada!"
          description="Obrigado por compartilhar como você está. Sua resposta é anônima e ajuda a empresa a cuidar do clima do seu setor."
        />
      ) : (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Termômetro do setor</CardTitle>
            <CardDescription>Sua resposta é anônima e leva menos de um minuto.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="mood-sector">Qual é o seu setor?</Label>
                <Select
                  value={sectorId}
                  onValueChange={setSectorId}
                  disabled={registerMood.isPending || sectors.length === 0}
                >
                  <SelectTrigger
                    id="mood-sector"
                    className="h-11 w-full"
                    aria-invalid={errors.sectorId !== undefined}
                  >
                    <SelectValue placeholder={company.isPending ? 'Carregando…' : 'Selecione'} />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((sector) => (
                      <SelectItem key={sector.id} value={String(sector.id)}>
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {withoutSectors && (
                  <p className="text-xs text-muted-foreground">
                    Esta empresa ainda não cadastrou setores. Avise o responsável pelo programa.
                  </p>
                )}

                {errors.sectorId !== undefined && (
                  <p className="text-xs text-destructive">{errors.sectorId}</p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="mood-score">Como você está se sentindo hoje?</Label>

                <MoodPicker
                  id="mood-score"
                  value={mood}
                  onChange={setMood}
                  invalid={errors.mood !== undefined}
                  disabled={registerMood.isPending}
                />

                <p className="text-sm text-muted-foreground">
                  {mood === null
                    ? 'Toque na carinha que mais combina com o seu momento.'
                    : `Você escolheu: ${moodLabel(mood).toLowerCase()}.`}
                </p>

                {errors.mood !== undefined && (
                  <p className="text-xs text-destructive">{errors.mood}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="mood-description">
                  Comentário, sugestão ou observação:{' '}
                  <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <Textarea
                  id="mood-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  aria-invalid={errors.description !== undefined}
                  maxLength={MAX_DESCRIPTION}
                  rows={4}
                  placeholder="Quer contar o que influenciou o seu humor?"
                />

                <div className="flex items-center justify-between gap-3">
                  {errors.description === undefined ? (
                    <span />
                  ) : (
                    <p className="text-xs text-destructive">{errors.description}</p>
                  )}
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {description.length}/{MAX_DESCRIPTION}
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-11 w-full"
                disabled={registerMood.isPending || company.data === undefined || withoutSectors}
              >
                {registerMood.isPending ? 'Enviando…' : 'Enviar resposta'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </PublicShell>
  );
}
