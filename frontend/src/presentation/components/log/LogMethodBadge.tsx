import type { LogMethod } from '@/domain/log/entities/Log';
import { Badge } from '@/presentation/components/ui/badge';

const METHOD_STYLES: Record<LogMethod, string> = {
  POST: 'border-emerald-500 bg-emerald-100 text-emerald-700',
  PUT: 'border-amber-500 bg-amber-100 text-amber-700',
  PATCH: 'border-blue-500 bg-blue-100 text-blue-700',
  DELETE: 'border-destructive/40 bg-destructive/10 text-destructive',
};

export function LogMethodBadge({ method }: { method: LogMethod | null }) {
  if (method === null) {
    return <Badge variant="secondary">Ação</Badge>;
  }

  return (
    <Badge variant="outline" className={`font-mono ${METHOD_STYLES[method]}`}>
      {method}
    </Badge>
  );
}
