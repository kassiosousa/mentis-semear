import type { ErrorComponentProps } from '@tanstack/react-router';
import { AppFooter } from '@/presentation/components/layout/AppFooter';
import { Button } from '@/presentation/components/ui/button';

export function RouteErrorPage({ error, reset }: ErrorComponentProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-2xl font-semibold">Algo deu errado</p>
        <p className="max-w-md text-sm text-muted-foreground">{error.message}</p>

        <Button variant="outline" onClick={reset}>
          Tentar novamente
        </Button>
      </div>

      <AppFooter />
    </div>
  );
}
