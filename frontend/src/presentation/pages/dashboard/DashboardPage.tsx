import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import { useCurrentUser } from '@/presentation/hooks/useSession';

export function DashboardPage() {
  const user = useCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Painel</h1>
        <p className="text-sm text-muted-foreground">Bem-vindo, {user?.name}.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Ordens de serviço</CardTitle>
            <CardDescription>Módulo ainda não implementado.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">—</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>Módulo ainda não implementado.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">—</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estoque</CardTitle>
            <CardDescription>Módulo ainda não implementado.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">—</CardContent>
        </Card>
      </div>
    </div>
  );
}
