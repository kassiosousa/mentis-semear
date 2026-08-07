import { useMutation } from '@tanstack/react-query';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useState, type ComponentProps } from 'react';
import type { Credentials } from '@/domain/auth/entities/AuthSession';
import { ValidationError } from '@/domain/shared/errors/AppError';
import { Button } from '@/presentation/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { container } from '@/presentation/container';
import { loginRoute } from '@/presentation/routes/modules/auth.routes';

export function SignInPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { redirect } = loginRoute.useSearch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signIn = useMutation({
    mutationFn: (credentials: Credentials) => container.auth.signIn.execute(credentials),
    onSuccess: async () => {
      if (redirect === undefined) {
        await navigate({ to: '/' });
        return;
      }

      router.history.push(redirect);
    },
  });

  const fieldErrors = signIn.error instanceof ValidationError ? signIn.error.fields : {};

  const onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();
    signIn.mutate({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Acesse o painel de gestão da oficina.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={fieldErrors.email !== undefined}
                required
              />
              {fieldErrors.email?.map((message) => (
                <p key={message} className="text-xs text-destructive">
                  {message}
                </p>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={fieldErrors.password !== undefined}
                required
              />
              {fieldErrors.password?.map((message) => (
                <p key={message} className="text-xs text-destructive">
                  {message}
                </p>
              ))}
            </div>

            {signIn.error !== null && !(signIn.error instanceof ValidationError) && (
              <p className="text-sm text-destructive">{signIn.error.message}</p>
            )}

            <Button type="submit" disabled={signIn.isPending}>
              {signIn.isPending ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
