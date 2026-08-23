import { Link } from '@tanstack/react-router';
import { Button } from '@/presentation/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-5xl font-semibold">404</p>
      <p className="text-muted-foreground">A página que você procura não existe.</p>

      <Button asChild variant="outline">
        <Link to="/">Voltar ao painel</Link>
      </Button>
    </div>
  );
}
