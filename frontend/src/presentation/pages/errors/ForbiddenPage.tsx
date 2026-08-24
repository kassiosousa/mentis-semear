import { Link } from '@tanstack/react-router';
import { AppFooter } from '@/presentation/components/layout/AppFooter';
import { Button } from '@/presentation/components/ui/button';

export function ForbiddenPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-5xl font-semibold">403</p>
        <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>

        <Button asChild variant="outline">
          <Link to="/">Voltar ao painel</Link>
        </Button>
      </div>

      <AppFooter />
    </div>
  );
}
