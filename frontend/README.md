# Frontend — Mentis Semear

SPA em React 19 + Vite + TypeScript, organizada em **Clean Architecture** com camadas globais e subpastas por módulo.

## Stack

| Papel              | Ferramenta                          |
| ------------------ | ----------------------------------- |
| Build              | Vite 8                              |
| UI                 | Tailwind CSS 4 + shadcn/ui (Radix)  |
| Ícones / fonte     | lucide-react / Geist                |
| Rotas              | TanStack Router                     |
| Estado de servidor | TanStack Query                      |
| HTTP               | axios (interceptors de auth)        |
| Lint               | oxlint                              |

## Estrutura

```
src/
├── config/env.ts             leitura das variáveis VITE_*
├── lib/utils.ts              cn() usado pelos componentes shadcn
├── domain/                   regras puras — sem framework, sem HTTP
│   ├── shared/errors/        AppError e subtipos (Validation, Unauthorized, …)
│   ├── auth/                 entities/ + repositories/ (contratos)
│   └── seed/                 entities/ + repositories/
├── application/              casos de uso, dependem só de contratos do domínio
│   ├── auth/useCases/        SignIn, SignOut, RestoreSession
│   └── seed/useCases/        ListSeeds, CreateSeed
├── infrastructure/           implementações concretas
│   ├── http/                 HttpClient (porta), AxiosHttpClient, interceptors, mapeamento de erros
│   ├── storage/              BrowserSessionStorage (localStorage + observável)
│   ├── auth/                 HttpAuthRepository, mappers da API
│   └── seed/                 HttpSeedRepository
└── presentation/             React
    ├── container.ts          composition root — liga tudo
    ├── queryClient.ts        política de cache/retry
    ├── routes/               árvore de rotas, guards e router
    ├── pages/                telas por módulo
    ├── components/ui/        shadcn (gerado — não editar à mão)
    ├── components/layout/    AppLayout (sidebar + header)
    └── hooks/                hooks de consumo dos casos de uso
```

Regra de dependência: `presentation → application → domain ← infrastructure`. A inversão acontece em `presentation/container.ts`.

## Controle de acesso nas rotas

O guard é o `beforeLoad` do TanStack Router: ele roda antes da rota **e de todos os seus filhos**, e um `redirect` lançado nele cancela o carregamento da subárvore.

`presentation/routes/guards.ts` expõe:

| Guard                              | Efeito                                                          |
| ---------------------------------- | --------------------------------------------------------------- |
| `requireAuth`                      | sem sessão → `/login?redirect=<rota>`                            |
| `requireGuest`                     | com sessão → `/`                                                 |
| `requirePermissions(...perms)`     | exige **todas** as permissões; senão → `/sem-permissao`          |
| `requireAnyPermission(...perms)`   | exige **ao menos uma**; senão → `/sem-permissao`                 |
| `requireRole(role)`                | exige o papel; senão → `/sem-permissao`                          |

`protectedRoute` é um layout sem path que aplica `requireAuth` — toda rota pendurada nele já nasce autenticada. O papel `admin` passa por qualquer checagem de permissão (`SUPER_ADMIN_ROLE` em `domain/auth/entities/User.ts`).

Na UI, o hook `usePermissions()` (`can`, `canAny`, `is`) esconde o que o usuário não pode acessar.

## Camada HTTP

`infrastructure/http/createApiClient.ts` registra dois interceptors:

1. **request** — injeta `Authorization: Bearer <token>` a partir da sessão, salvo quando a chamada usa `skipAuth: true` (login e refresh).
2. **response** — em `401`, dispara **uma única** renovação compartilhada (requisições concorrentes esperam a mesma promise), regrava os tokens e reenvia a requisição original uma vez. Se a renovação falhar, limpa a sessão e emite `mentis:session-expired`, que o `main.tsx` converte em navegação para `/login`.

Todo erro sai do axios já traduzido para os tipos de `domain/shared/errors/AppError` — nenhum status code vaza para as camadas de dentro. O `422` do Laravel vira `ValidationError.fields`, consumido direto pelos formulários.

A sessão é persistida em `localStorage` (`mentis.auth.session`) e sincronizada entre abas pelo evento `storage`.

### Endpoints esperados do backend

Ainda **não existem** no Laravel — precisam ser criados:

| Método | Rota             | Retorno                                             |
| ------ | ---------------- | --------------------------------------------------- |
| POST   | `/auth/login`    | `{ user, access_token, refresh_token?, expires_in? }` |
| POST   | `/auth/logout`   | `204`                                                |
| GET    | `/auth/me`       | `{ id, name, email, roles[], permissions[] }`         |
| POST   | `/auth/refresh`  | `{ access_token, refresh_token?, expires_in? }`       |

Respostas envelopadas em `{ data: … }` são desembrulhadas automaticamente (`infrastructure/http/envelope.ts`).

## Como adicionar um módulo

Exemplo: módulo de clientes.

1. **domain** — `domain/customer/entities/Customer.ts` e `domain/customer/repositories/CustomerRepository.ts` (interface).
2. **application** — `application/customer/useCases/ListCustomers.ts` etc., recebendo o repositório por construtor.
3. **infrastructure** — `infrastructure/customer/HttpCustomerRepository.ts`, implementando o contrato via `HttpClient`.
4. **container** — instancie o repositório e os casos de uso em `presentation/container.ts`.
5. **presentation** — página em `presentation/pages/customers/`, hook em `presentation/hooks/useCustomers.ts` (TanStack Query).
6. **rota** — `presentation/routes/modules/customers.routes.tsx` pendurada em `protectedRoute`, com `beforeLoad: requirePermissions('customers.view')` e `component: lazyRouteComponent(...)` para virar um chunk próprio.
7. **árvore** — registre a rota em `presentation/routes/routeTree.ts` e o item de menu em `components/layout/AppLayout.tsx`.

## Comandos

```bash
npm run dev      # servidor de desenvolvimento (5173)
npm run build    # type-check + build de produção
npm run lint     # oxlint
```

Componentes shadcn novos: `npx shadcn@latest add <componente>` — vão para `src/presentation/components/ui/` conforme `components.json`.

## Variáveis de ambiente

| Variável              | Default  | Descrição                                            |
| --------------------- | -------- | ---------------------------------------------------- |
| `VITE_API_URL`        | `/api`   | Base da API. Em produção o nginx serve o front e faz proxy de `/api` na mesma origem. |
| `VITE_API_TIMEOUT_MS` | `15000`  | Timeout das requisições.                              |
