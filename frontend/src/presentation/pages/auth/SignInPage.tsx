import { useMutation } from '@tanstack/react-query';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useState, type ComponentProps } from 'react';
import { toast } from 'sonner';
import type { Credentials } from '@/domain/auth/entities/AuthSession';
import { ValidationError } from '@/domain/shared/errors/AppError';
import SplitText from '@/presentation/components/animations/SplitText';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { container } from '@/presentation/container';
import { loginRoute } from '@/presentation/routes/modules/auth.routes';

const SIGN_IN_TOAST = 'sign-in';

export function SignInPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { redirect } = loginRoute.useSearch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signIn = useMutation({
    mutationFn: (credentials: Credentials) => container.auth.signIn.execute(credentials),
    onSuccess: async () => {
      toast.success('Login realizado com sucesso.', { id: SIGN_IN_TOAST });

      if (redirect === undefined) {
        await navigate({ to: '/' });
        return;
      }

      router.history.push(redirect);
    },
    onError: (error) => {
      toast.error('Não foi possível entrar.', {
        id: SIGN_IN_TOAST,
        description: error.message,
      });
    },
  });

  const fieldErrors = signIn.error instanceof ValidationError ? signIn.error.fields : {};

  const onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();
    signIn.mutate({ email, password });
  };

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] lg:grid-cols-2 lg:grid-rows-1">
      <section className="relative isolate flex items-center overflow-hidden bg-linear-to-br from-primary-700 via-primary-500 to-secondary-700 px-8 py-16 lg:px-16 lg:py-0">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-24 -z-10 size-80 rounded-full bg-white/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-32 -z-10 size-96 rounded-full bg-secondary-700/50 blur-3xl"
        />

        <div className="flex max-w-xl flex-col gap-4">
          <SplitText
            text="Bem vindo ao Mentis Semear."
            tag="h4"
            textAlign="center"
            className="font-heading text-2xl leading-tight font-medium tracking-tight text-white sm:text-3xl lg:text-4xl"
            splitType="chars"
            delay={30}
            duration={0.9}
            ease="power3.out"
            from={{ opacity: 0, y: 56 }}
            to={{ opacity: 1, y: 0 }}
          />

          <SplitText
            text="Acesse sua conta."
            tag="p"
            textAlign="left"
            className="text-xl font-light text-white/90 lg:text-2xl"
            splitType="chars"
            delay={25}
            duration={0.8}
            ease="power3.out"
            from={{ opacity: 0, y: 28 }}
            to={{ opacity: 1, y: 0, delay: 0.55 }}
          />
        </div>
      </section>

      <section className="flex items-center justify-center bg-background px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <img
            src="/assets/logo-verde.png"
            alt="Mentis Semear"
            className="mx-auto h-32 w-auto select-none"
          />

          <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="voce@email.com"
                className="h-11"
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
                placeholder="••••••••"
                className="h-11 tracking-wider"
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

            <Button type="submit" disabled={signIn.isPending} className="mt-1 h-11 w-full text-sm">
              {signIn.isPending ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
