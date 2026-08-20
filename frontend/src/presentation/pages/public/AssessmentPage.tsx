import { useState, type ComponentProps } from 'react';
import { toast } from 'sonner';
import { NotFoundError } from '@/domain/shared/errors/AppError';
import type { AssessmentInput } from '@/domain/workshop/repositories/PublicWorkshopRepository';
import { Button } from '@/presentation/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import { Label } from '@/presentation/components/ui/label';
import { StarRating } from '@/presentation/components/ui/star-rating';
import { Textarea } from '@/presentation/components/ui/textarea';
import { usePublicWorkshop, useRegisterAssessment } from '@/presentation/hooks/usePublicWorkshop';
import { describeError, toFormErrors } from '@/presentation/pages/public/publicErrors';
import {
  InvalidLinkNotice,
  PublicShell,
  SuccessPanel,
  WorkshopSummary,
} from '@/presentation/pages/public/PublicShell';
import { assessmentRoute } from '@/presentation/routes/modules/public.routes';

const TOAST_ID = 'public-assessment';
const MAX_SCORE = 10;
const MAX_SUGGESTIONS = 500;

const FIELD_BY_API: Record<string, string> = {
  workshop_id: 'workshopId',
  score: 'score',
  suggestions: 'suggestions',
};

const MESSAGE_BY_API: Record<string, string> = {
  workshop_id: 'Este link não aponta para uma oficina válida.',
  score: 'Selecione uma nota de 1 a 10.',
  suggestions: `Use no máximo ${MAX_SUGGESTIONS} caracteres.`,
};

const SCORE_LABELS: Record<number, string> = {
  1: 'Muito ruim',
  2: 'Ruim',
  3: 'Ruim',
  4: 'Abaixo do esperado',
  5: 'Regular',
  6: 'Regular',
  7: 'Bom',
  8: 'Muito bom',
  9: 'Ótimo',
  10: 'Excelente',
};

export function AssessmentPage() {
  const { token } = assessmentRoute.useParams();

  const workshop = usePublicWorkshop(token);
  const registerAssessment = useRegisterAssessment();

  const [score, setScore] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();

    if (workshop.data === undefined) return;

    const text = suggestions.trim();

    if (score === null) {
      setErrors({ score: 'Selecione uma nota de 1 a 10.' });
      return;
    }

    if (text.length > MAX_SUGGESTIONS) {
      setErrors({ suggestions: `Use no máximo ${MAX_SUGGESTIONS} caracteres.` });
      return;
    }

    setErrors({});

    const input: AssessmentInput = {
      workshopId: workshop.data.id,
      score,
      suggestions: text === '' ? null : text,
    };

    registerAssessment.mutate(input, {
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
              ? 'Este link de avaliação não existe ou foi desativado. Peça um novo link a quem aplicou a oficina.'
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
          title="Avaliação enviada!"
          description="Obrigado por compartilhar sua opinião. Sua resposta é anônima e ajuda a melhorar as próximas oficinas."
        />
      ) : (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Avaliação da oficina</CardTitle>
            <CardDescription>
              Sua resposta é anônima e leva menos de um minuto.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Label htmlFor="assessment-score">Qual nota você dá para esta oficina?</Label>

                <StarRating
                  id="assessment-score"
                  value={score}
                  onChange={setScore}
                  max={MAX_SCORE}
                  label="Nota de 1 a 10"
                  invalid={errors.score !== undefined}
                  disabled={registerAssessment.isPending}
                />

                <p className="text-sm text-muted-foreground">
                  {score === null ? (
                    'Toque nas estrelas para escolher de 1 a 10.'
                  ) : (
                    <>
                      <span className="font-semibold tabular-nums text-primary">
                        {score}/{MAX_SCORE}
                      </span>{' '}
                      · {SCORE_LABELS[score]}
                    </>
                  )}
                </p>

                {errors.score !== undefined && (
                  <p className="text-xs text-destructive">{errors.score}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="assessment-suggestions">
                  Comentário, sugestão ou observação:{' '}
                  <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <Textarea
                  id="assessment-suggestions"
                  value={suggestions}
                  onChange={(event) => setSuggestions(event.target.value)}
                  aria-invalid={errors.suggestions !== undefined}
                  maxLength={MAX_SUGGESTIONS}
                  rows={4}
                  placeholder="O que funcionou bem? O que poderia melhorar?"
                />

                <div className="flex items-center justify-between gap-3">
                  {errors.suggestions === undefined ? (
                    <span />
                  ) : (
                    <p className="text-xs text-destructive">{errors.suggestions}</p>
                  )}
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {suggestions.length}/{MAX_SUGGESTIONS}
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-11 w-full"
                disabled={registerAssessment.isPending || workshop.data === undefined}
              >
                {registerAssessment.isPending ? 'Enviando…' : 'Enviar avaliação'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </PublicShell>
  );
}
