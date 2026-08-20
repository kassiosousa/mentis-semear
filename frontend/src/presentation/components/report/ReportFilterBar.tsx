import { ChevronDown, FilterX, SlidersHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { Fragment, useMemo, useState } from 'react';
import { REPORT_PER_PAGE_OPTIONS } from '@/domain/report/repositories/ReportRepository';
import { cn } from '@/lib/utils';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { useCompanies } from '@/presentation/hooks/useCompanies';
import { useWorkshopsReport } from '@/presentation/hooks/useReports';
import { useSectors } from '@/presentation/hooks/useSectors';
import { useUsers } from '@/presentation/hooks/useUsers';
import type {
  ReportFilterField,
  ReportFilterState,
  ReportScope,
} from '@/presentation/components/report/reportFilters';
import { ALL, countActive, idOf } from '@/presentation/components/report/reportFilters';
import { formatShortDate } from '@/presentation/components/report/reportFormat';

const WORKSHOP_OPTIONS_LIMIT = 100;

const DEFAULT_PRIMARY: readonly ReportFilterField[] = ['period'];

interface ReportFilterBarProps {
  scope: ReportScope;
  companyId: number | null;
  facilitatorId: string | null;
  fields: readonly ReportFilterField[];
  primary?: readonly ReportFilterField[];
  value: ReportFilterState;
  onChange: (patch: Partial<ReportFilterState>) => void;
  onClear: () => void;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function ReportFilterBar({
  scope,
  companyId,
  facilitatorId,
  fields,
  primary = DEFAULT_PRIMARY,
  value,
  onChange,
  onClear,
}: ReportFilterBarProps) {
  const [open, setOpen] = useState(false);

  const has = (field: ReportFilterField) => fields.includes(field);
  const selectedCompany = scope === 'empresa' ? companyId : (idOf(value.companyId) ?? null);

  const companiesQuery = useCompanies({ page: 1 }, scope === 'admin' && has('company'));
  const sectorsQuery = useSectors(
    { companyId: selectedCompany ?? undefined, page: 1 },
    has('sector') && scope !== 'facilitador',
  );
  const facilitatorsQuery = useUsers(
    { type: 'facilitador', page: 1 },
    scope === 'admin' && has('facilitator'),
  );
  const workshopsQuery = useWorkshopsReport(
    {
      perPage: WORKSHOP_OPTIONS_LIMIT,
      companyId: selectedCompany ?? undefined,
      facilitatorId: facilitatorId ?? undefined,
    },
    has('workshop'),
  );

  const companies = companiesQuery.data?.companies ?? [];
  const sectors = sectorsQuery.data?.sectors ?? [];
  const facilitators = facilitatorsQuery.data?.users ?? [];
  const workshops = useMemo(() => workshopsQuery.data?.page.rows ?? [], [workshopsQuery.data]);

  const change = (patch: Partial<ReportFilterState>) => onChange(patch);

  const renderField = (field: ReportFilterField): ReactNode => {
    if (field === 'period') {
      return (
        <>
          <Field label="Data inicial">
            <Input
              type="date"
              value={value.dateFrom}
              max={value.dateTo === '' ? undefined : value.dateTo}
              onChange={(event) => change({ dateFrom: event.target.value })}
              className="h-9"
            />
          </Field>

          <Field label="Data final">
            <Input
              type="date"
              value={value.dateTo}
              min={value.dateFrom === '' ? undefined : value.dateFrom}
              onChange={(event) => change({ dateTo: event.target.value })}
              className="h-9"
            />
          </Field>
        </>
      );
    }

    if (field === 'time') {
      return (
        <>
          <Field label="Hora inicial">
            <Input
              type="time"
              value={value.timeFrom}
              onChange={(event) => change({ timeFrom: event.target.value })}
              className="h-9"
            />
          </Field>

          <Field label="Hora final">
            <Input
              type="time"
              value={value.timeTo}
              onChange={(event) => change({ timeTo: event.target.value })}
              className="h-9"
            />
          </Field>
        </>
      );
    }

    if (field === 'company') {
      if (scope !== 'admin') return null;

      return (
        <Field label="Empresa">
          <Select
            value={value.companyId}
            onValueChange={(next) => change({ companyId: next, sectorId: ALL, workshopId: ALL })}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={String(company.id)}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      );
    }

    if (field === 'facilitator') {
      if (scope !== 'admin') return null;

      return (
        <Field label="Facilitador">
          <Select
            value={value.facilitatorId}
            onValueChange={(next) => change({ facilitatorId: next })}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos</SelectItem>
              {facilitators.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      );
    }

    if (field === 'sector') {
      if (scope === 'facilitador') return null;

      return (
        <Field label="Setor">
          <Select value={value.sectorId} onValueChange={(next) => change({ sectorId: next })}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos</SelectItem>
              {sectors.map((sector) => (
                <SelectItem key={sector.id} value={String(sector.id)}>
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      );
    }

    if (field === 'workshop') {
      return (
        <Field label="Oficina">
          <Select value={value.workshopId} onValueChange={(next) => change({ workshopId: next })}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas</SelectItem>
              {workshops.map((workshop) => (
                <SelectItem key={workshop.id} value={String(workshop.id)}>
                  {`#${workshop.id} · ${formatShortDate(workshop.datetime)}${
                    workshop.company === null ? '' : ` · ${workshop.company}`
                  }`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      );
    }

    if (field === 'score') {
      return (
        <>
          <Field label="Nota mínima">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              max={10}
              step="0.5"
              placeholder="0"
              value={value.minScore}
              onChange={(event) => change({ minScore: event.target.value })}
              className="h-9"
            />
          </Field>

          <Field label="Nota máxima">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              max={10}
              step="0.5"
              placeholder="10"
              value={value.maxScore}
              onChange={(event) => change({ maxScore: event.target.value })}
              className="h-9"
            />
          </Field>
        </>
      );
    }

    if (field === 'diary') {
      return (
        <Field label="Diário de bordo">
          <Select value={value.hasDiary} onValueChange={(next) => change({ hasDiary: next })}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas</SelectItem>
              <SelectItem value="sim">Com diário</SelectItem>
              <SelectItem value="nao">Sem diário</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      );
    }

    return (
      <Field label="Itens por página">
        <Select
          value={String(value.perPage)}
          onValueChange={(next) => change({ perPage: Number(next) })}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REPORT_PER_PAGE_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    );
  };

  const primaryFields = fields.filter((field) => primary.includes(field));
  const advancedFields = fields.filter((field) => !primary.includes(field));
  const advancedCount = countActive(value, advancedFields);
  const canClear = countActive(value, fields) > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:max-w-md">
          {primaryFields.map((field) => (
            <Fragment key={field}>{renderField(field)}</Fragment>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {advancedFields.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen((current) => !current)}
              aria-expanded={open}
              className="h-9"
            >
              <SlidersHorizontal className="size-4" />
              Filtros avançados
              {advancedCount > 0 && (
                <Badge variant="secondary" className="ml-0.5 tabular-nums">
                  {advancedCount}
                </Badge>
              )}
              <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
            </Button>
          )}

          {canClear && (
            <Button variant="ghost" size="sm" onClick={onClear} className="h-9">
              <FilterX className="size-4" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {open && advancedFields.length > 0 && (
        <div className="grid gap-3 border-t border-border pt-3 sm:grid-cols-2 xl:grid-cols-4">
          {advancedFields.map((field) => (
            <Fragment key={field}>{renderField(field)}</Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
