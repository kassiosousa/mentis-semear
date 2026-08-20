import {
  Building2,
  CalendarRange,
  LayoutDashboard,
  Star,
  ThermometerSun,
  Users,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { lazy, Suspense, useMemo, useState } from 'react';
import { PageHeading } from '@/presentation/components/layout/PageHeading';
import type {
  ReportFilterState,
  ReportScope,
} from '@/presentation/components/report/reportFilters';
import { INITIAL_FILTERS } from '@/presentation/components/report/reportFilters';
import { AssessmentsReportTab } from '@/presentation/components/report/tabs/AssessmentsReportTab';
import { CheckInsReportTab } from '@/presentation/components/report/tabs/CheckInsReportTab';
import { CompanyPanelReportTab } from '@/presentation/components/report/tabs/CompanyPanelReportTab';
import { MoodReportTab } from '@/presentation/components/report/tabs/MoodReportTab';
import type { ReportTabProps } from '@/presentation/components/report/tabs/types';
import { WorkshopsReportTab } from '@/presentation/components/report/tabs/WorkshopsReportTab';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/tabs';
import { useCurrentUser } from '@/presentation/hooks/useSession';

const CompaniesReportTab = lazy(async () => {
  const module = await import('@/presentation/components/report/tabs/CompaniesReportTab');

  return { default: module.CompaniesReportTab };
});

interface ReportTabConfig {
  value: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  scopes: readonly ReportScope[];
  component: ComponentType<ReportTabProps>;
}

const TABS: readonly ReportTabConfig[] = [
  {
    value: 'oficinas',
    label: 'Oficinas',
    icon: CalendarRange,
    scopes: ['admin', 'empresa', 'facilitador'],
    component: WorkshopsReportTab,
  },
  {
    value: 'participacao',
    label: 'Participação',
    icon: Users,
    scopes: ['admin', 'empresa', 'facilitador'],
    component: CheckInsReportTab,
  },
  {
    value: 'satisfacao',
    label: 'Satisfação',
    icon: Star,
    scopes: ['admin', 'empresa', 'facilitador'],
    component: AssessmentsReportTab,
  },
  {
    value: 'empresas',
    label: 'Empresas',
    icon: Building2,
    scopes: ['admin'],
    component: CompaniesReportTab,
  },
  {
    value: 'termometro',
    label: 'Termômetro',
    icon: ThermometerSun,
    scopes: ['admin', 'empresa'],
    component: MoodReportTab,
  },
  {
    value: 'painel',
    label: 'Painel da empresa',
    icon: LayoutDashboard,
    scopes: ['admin', 'empresa'],
    component: CompanyPanelReportTab,
  },
];

const SUBTITLES: Record<ReportScope, string> = {
  admin: 'Indicadores consolidados de todas as empresas atendidas.',
  empresa: 'Indicadores das oficinas e do termômetro emocional da sua empresa.',
  facilitador: 'Indicadores das oficinas em que você atuou como facilitador.',
};

export function ReportsListing({ scope }: { scope: ReportScope }) {
  const user = useCurrentUser();

  const tabs = useMemo(() => TABS.filter((tab) => tab.scopes.includes(scope)), [scope]);

  const [active, setActive] = useState(tabs[0]?.value ?? 'oficinas');
  const [filters, setFilters] = useState<ReportFilterState>(INITIAL_FILTERS);

  const changeFilters = (patch: Partial<ReportFilterState>) => {
    setFilters((current) => ({ ...current, ...patch }));
  };

  const clearFilters = () => setFilters(INITIAL_FILTERS);

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Relatórios" subtitle={SUBTITLES[scope]} />

      <Tabs value={active} onValueChange={setActive} className="gap-4">
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <TabsList className="w-max">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 px-3">
                <tab.icon className="size-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <tab.component
                scope={scope}
                companyId={user?.companyId ?? null}
                facilitatorId={user?.id ?? null}
                filters={filters}
                onFilterChange={changeFilters}
                onClear={clearFilters}
              />
            </Suspense>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
