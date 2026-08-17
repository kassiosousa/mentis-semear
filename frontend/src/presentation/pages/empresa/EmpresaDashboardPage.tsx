import { Layers, MessageSquareHeart, Smile } from 'lucide-react';
import { moodLabel, moodScoreFromAverage } from '@/domain/mood/entities/MoodSummary';
import { StatCard } from '@/presentation/components/dashboard/panels';
import { PageHeading } from '@/presentation/components/layout/PageHeading';
import { MoodFaceScale } from '@/presentation/components/mood/MoodFace';
import { SectorsOverview } from '@/presentation/components/sector/SectorsOverview';
import { useMoodSummary } from '@/presentation/hooks/useMoodSummary';
import { useSectors } from '@/presentation/hooks/useSectors';
import { useCurrentUser } from '@/presentation/hooks/useSession';

export function EmpresaDashboardPage() {
  const user = useCurrentUser();
  const companyId = user?.companyId ?? undefined;

  const sectors = useSectors({ companyId, page: 1 });
  const moods = useMoodSummary({ companyId });

  const averageScore = moodScoreFromAverage(moods.data?.average);

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Painel da Empresa" subtitle={`Bem-vindo, ${user?.name ?? ''}.`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Setores"
          value={sectors.isSuccess ? String(sectors.data.total) : '—'}
          icon={Layers}
        />
        <StatCard
          label="Respostas do termômetro"
          value={moods.isSuccess ? String(moods.data.total) : '—'}
          icon={MessageSquareHeart}
        />
        <StatCard
          label="Humor médio"
          value={moods.isSuccess ? (moods.data.average?.toFixed(2) ?? '—') : '—'}
          hint={
            averageScore === null
              ? 'Escala de 1 (muito mal) a 5 (muito bem)'
              : `${moodLabel(averageScore)} · escala de 1 (muito mal) a 5 (muito bem)`
          }
          icon={Smile}
          accessory={<MoodFaceScale active={averageScore} size="md" />}
        />
      </div>

      <SectorsOverview scope="empresa" companyId={companyId} />
    </div>
  );
}
