---
description: Scaffold de um CRUD completo de entidade (Clean Arch + Swagger + testes) seguindo backend/CLAUDE.md
argument-hint: <NomeDaEntidade> [notas sobre campos/relacionamentos]
---

Crie um CRUD completo para a entidade **$ARGUMENTS** no backend Laravel, seguindo **estritamente** o `backend/CLAUDE.md`. Tudo roda no container (`docker compose exec php ...`).

Antes de criar arquivos: **liste o plano** (tabela, campos, relacionamentos, se é admin-only) e me peça confirmação se algo estiver ambíguo.

Depois implemente:

1. **Migration** (`database/migrations/`): tabela plural snake_case, PK `$table->id()`. FKs para `users` = `foreignUuid` (char36); demais = `foreignId`. `timestamps()`. Índices/uniques onde fizer sentido.
2. **Model** (`app/Models/`, `final`): `$fillable`, `casts()`, e relacionamentos (`belongsTo`/`hasMany`/`hasOne`) ligando às entidades existentes.
3. **FormRequests** `Store{Entidade}Request` + `Update{Entidade}Request` (`app/Http/Requests/{Entidade}/`): validação completa; no update use `sometimes` e `unique` ignorando o próprio registro.
4. **Controller** (`app/Http/Controllers/Api/{Entidade}Controller.php`, `final`): RESTful (index paginado, store, show, update, destroy), só orquestra. **Anotações `#[OA\...]` em TODOS os métodos**, com `security: [['bearerAuth' => []]]` nos protegidos. `destroy` captura `QueryException` (FK) e retorna 409.
5. **Schema OpenAPI** em `app/OpenApi/{Entidade}Schema.php`.
6. **Rotas** (`routes/api.php`): `Route::apiResource(...)` dentro de `->middleware(['auth:api', ...])`. Decida (ou pergunte) se é `type:admin`.
7. **Testes** (`tests/Feature/{Entidade}Test.php`): caminho feliz + autorização (401/403) + validação (422). Auth via `auth('api')->login($user)` + `->withToken()`.
8. Rode `php artisan migrate:fresh`, `php artisan l5-swagger:generate` e `php artisan test` — **verifique tudo verde** e mostre o resultado.

**Não commite** — deixe as mudanças no working tree para eu revisar, e me lembre de commitar ao final.
