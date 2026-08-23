import type { ComponentType, ReactNode } from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import { TableCell, TableRow } from '@/presentation/components/ui/table';

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
  accessory?: ReactNode;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accessory,
  loading = false,
}: StatCardProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription className="flex items-center gap-2 text-xs">
          <Icon className="size-4 text-primary" />
          {label}
        </CardDescription>
        <CardTitle className="flex items-center justify-between gap-3 text-3xl font-semibold tabular-nums">
          {loading ? <Skeleton className="h-8 w-24" /> : value}
          {accessory}
        </CardTitle>
        {hint !== undefined && (
          <span className="text-xs text-muted-foreground">{hint}</span>
        )}
      </CardHeader>
    </Card>
  );
}

export function AwaitingApiRow({ colSpan }: { colSpan: number }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={colSpan}
        className="py-10 text-center text-sm whitespace-normal text-muted-foreground"
      >
        Sem dados — este módulo ainda não tem endpoint na API.
      </TableCell>
    </TableRow>
  );
}

export function AwaitingApiBlock({ children }: { children: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
