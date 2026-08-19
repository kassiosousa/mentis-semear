import type { ReactNode } from 'react';
import { actionOf, isSuccessStatus } from '@/domain/log/entities/Log';
import { LogMethodBadge } from '@/presentation/components/log/LogMethodBadge';
import { Badge } from '@/presentation/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import { useLog } from '@/presentation/hooks/useLogs';

interface LogDetailDialogProps {
  logId: number | null;
  onOpenChange: (open: boolean) => void;
  userName: (id: string | null) => string;
  formatDateTime: (value: string | null) => string;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="text-sm text-title">{children}</div>
    </div>
  );
}

export function LogDetailDialog({
  logId,
  onOpenChange,
  userName,
  formatDateTime,
}: LogDetailDialogProps) {
  const query = useLog(logId);
  const log = query.data ?? null;
  const action = log === null ? null : actionOf(log);

  return (
    <Dialog open={logId !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes do registro</DialogTitle>
          <DialogDescription>
            {logId === null ? '' : `Log #${logId} — registro de auditoria imutável.`}
          </DialogDescription>
        </DialogHeader>

        {query.isPending && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        )}

        {query.isError && <p className="text-sm text-destructive">{query.error.message}</p>}

        {log !== null && action !== null && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ação">
              <div className="flex items-center gap-2">
                <LogMethodBadge method={action.method} />
                {action.status !== null && (
                  <Badge variant={isSuccessStatus(action.status) ? 'secondary' : 'destructive'}>
                    {action.status}
                  </Badge>
                )}
              </div>
            </Field>

            <Field label="Data e hora">{formatDateTime(log.createdAt)}</Field>

            <Field label="Usuário">
              <span>{userName(log.userId)}</span>
              {log.userId !== null && (
                <p className="font-mono text-[11px] break-all text-muted-foreground">{log.userId}</p>
              )}
            </Field>

            <Field label="Endpoint">
              <span className="font-mono text-xs break-all">{action.path ?? '—'}</span>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Descrição">
                <span className="font-mono text-xs break-all">{log.description || '—'}</span>
              </Field>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
