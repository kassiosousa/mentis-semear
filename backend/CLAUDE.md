# CLAUDE.md — Backend (Mentis Semear)

API Laravel do monólito Mentis Semear (plataforma de workshops em empresas). Este arquivo é lido automaticamente pelo Claude Code ao trabalhar no backend.

## Stack
- **Laravel 13** · **PHP 8.4** (obrigatório — o Symfony 8.1 travado exige ≥ 8.4.1)
- **MySQL 8** · **JWT** (`php-open-source-saver/jwt-auth`, guard `api`) · **Swagger** (`darkaonline/l5-swagger`)
- Tudo roda em **Docker**. Nunca rode `php`/`composer`/`artisan` no host — sempre no container:
  `docker compose exec php <cmd>` (a partir da raiz do repo, um nível acima de `backend/`).

## Arquitetura (Clean Architecture)
- `src/Domain/` — regras puras (entities, interfaces de repositório, exceptions). **Sem Laravel/Eloquent.**
- `src/Application/` — casos de uso + DTOs. Dependem só do Domain (por interface).
- `src/Infrastructure/` — implementações concretas (Eloquent, repositórios). Bindings em `src/Infrastructure/Providers/RepositoryServiceProvider.php`.
- `app/Http/` — camada de apresentação (Controllers, FormRequests, Middleware). Controllers só orquestram; nunca colocam regra de negócio.
- `app/Models/` — models Eloquent (persistência). Namespace PSR-4: `Src\` → `src/`.

## Convenções (seguir SEMPRE ao criar código)
- `declare(strict_types=1);` no topo de todo arquivo novo.
- Classes `final` por padrão.
- Validação em **FormRequest** (nunca no controller). Uma request por ação.
- **`users` usa UUID** (char36, `HasUuids`). Regra crítica: **toda FK que aponta para `users` é `foreignUuid` (char36)**; as demais são `foreignId` (bigint).
- Tipos/enums de domínio em `app/Enums/` (ex.: `UserType`). Validar entrada com `new Enum(...)`.
- **Todo endpoint novo precisa de anotação OpenAPI** (`#[OA\...]`) e, se protegido, `security: [['bearerAuth' => []]]`. Depois rode `php artisan l5-swagger:generate`.
- Autorização por tipo: middleware `type` (ex.: `->middleware(['auth:api','type:admin'])`).
- Respostas JSON: dados sob a chave `data`; erros com `message`.

## Comandos
```bash
docker compose exec php php artisan test            # suíte (sqlite :memory:, sem DB externo)
docker compose exec php php artisan migrate:fresh   # recria o schema (dev)
docker compose exec php ./vendor/bin/pint           # formata (PSR-12)
docker compose exec php php artisan l5-swagger:generate   # regenera a doc
docker compose exec php php artisan route:list --path=api
```
- Swagger UI: `http://localhost:8080/api/documentation` · JSON: `/docs`

## Testes
- `tests/Feature/*` com `RefreshDatabase`; auth nos testes via `auth('api')->login($user)` + `->withToken($token)`.
- Cada endpoint novo: cobrir caminho feliz + autorização (401/403) + validação (422).
- `phpunit.xml` fixa sqlite `:memory:`, drivers `array`, e `JWT_SECRET` de teste.

## Gotchas
- Após editar `config/*` ou `.env`, rode `php artisan config:clear` (o entrypoint de dev faz `config:cache`).
- `vendor` é volume nomeado; após `composer require`, rode `composer install` no container se necessário.
- Em dev use `migrate:fresh` (base greenfield, sem dados a preservar).

## Fluxo de trabalho
- **NÃO commitar sem pedido explícito do usuário.** Deixar as mudanças no working tree para revisão.
- **Ao fim de cada tarefa, lembrar o usuário de commitar** o que ficou pendente (trabalho uncommitted já se perdeu em trocas de branch).
- Antes de afirmar que algo funciona, **rodar e verificar** (testes + smoke real quando fizer sentido).
- Hooks automáticos (ver `.claude/`): Pint formata o PHP editado (PostToolUse) e a suíte roda ao fim do turno se houver `.php` pendente (Stop).
