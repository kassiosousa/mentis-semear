import type { ReactNode } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import type { ChartConfig } from '@/presentation/components/ui/chart';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/presentation/components/ui/chart';
import { truncate } from '@/presentation/components/report/reportFormat';

const ANIMATION_MS = 700;

export interface BarSeries {
  key: string;
  label: string;
  color: string;
}

export type ChartDatum = Record<string, string | number | null>;

interface ReportBarChartProps {
  data: ChartDatum[];
  xKey: string;
  series: readonly BarSeries[];
  cellColors?: readonly string[];
  horizontal?: boolean;
  stacked?: boolean;
  height?: number;
  emptyLabel?: string;
  tickFormatter?: (value: string) => string;
  allowDecimals?: boolean;
}

export function ChartPanel({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card size="sm" className={cn('min-w-0', className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description !== undefined && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ChartEmpty({ label, height }: { label: string; height: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg border border-dashed border-border px-4 text-center text-sm text-muted-foreground"
      style={{ height }}
    >
      {label}
    </div>
  );
}

export function ReportBarChart({
  data,
  xKey,
  series,
  cellColors,
  horizontal = false,
  stacked = false,
  height = 260,
  emptyLabel = 'Sem dados para os filtros aplicados.',
  tickFormatter,
  allowDecimals = false,
}: ReportBarChartProps) {
  const config: ChartConfig = Object.fromEntries(
    series.map((item) => [item.key, { label: item.label, color: item.color }]),
  );

  const hasValues = data.some((row) =>
    series.some((item) => {
      const value = row[item.key];

      return typeof value === 'number' && value > 0;
    }),
  );

  if (data.length === 0 || !hasValues) {
    return <ChartEmpty label={emptyLabel} height={height} />;
  }

  const resolvedHeight = horizontal ? Math.max(height, data.length * 36 + 48) : height;
  const formatTick = tickFormatter ?? ((value: string) => truncate(String(value), 14));

  return (
    <ChartContainer
      config={config}
      className="aspect-auto w-full"
      style={{ height: resolvedHeight }}
    >
      <BarChart
        accessibilityLayer
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 8, right: 12, bottom: 4, left: 4 }}
        barCategoryGap={horizontal ? '20%' : '18%'}
      >
        <CartesianGrid horizontal={!horizontal} vertical={horizontal} strokeDasharray="3 3" />

        {horizontal ? (
          <>
            <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={allowDecimals} />
            <YAxis
              type="category"
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              width={110}
              tickMargin={6}
              tickFormatter={formatTick}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={4}
              tickFormatter={formatTick}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={36}
              allowDecimals={allowDecimals}
              tickMargin={4}
            />
          </>
        )}

        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />

        {series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}

        {series.map((item, index) => (
          <Bar
            key={item.key}
            dataKey={item.key}
            name={item.label}
            fill={`var(--color-${item.key})`}
            stackId={stacked ? 'total' : undefined}
            radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            isAnimationActive
            animationDuration={ANIMATION_MS}
            animationBegin={index * 120}
            animationEasing="ease-out"
          >
            {cellColors !== undefined &&
              series.length === 1 &&
              data.map((_, cellIndex) => (
                <Cell key={cellIndex} fill={cellColors[cellIndex % cellColors.length]} />
              ))}
          </Bar>
        ))}
      </BarChart>
    </ChartContainer>
  );
}
