# 🌱 Mentis Semear

Monolito conteinerizado com backend **PHP / Laravel**, frontend **React / Vite / TypeScript** e banco **MySQL**, ambos organizados em **Clean Architecture**. Tudo orquestrado por um único `docker compose`.

## Stack

| Camada     | Tecnologia                    | Porta (host) |
| ---------- | ----------------------------- | ------------ |
| Frontend   | React + Vite + TypeScript     | `5173`       |
| Backend    | Laravel 13 (PHP 8.4, FPM)     | `8080`       |
| Web server | Nginx                         | `8080`       |
| Database   | MySQL 8                       | `3306`       |

## Estrutura do repositório

```
mentis-semear/
├── docker-compose.yml         # orquestra todos os serviços
├── .env.example               # variáveis do compose (copie para .env)
├── Makefile                   # atalhos (make up, make logs, ...)
├── docker/
│   ├── nginx/default.conf
│   └── php/{Dockerfile,php.ini,entrypoint.sh}
├── backend/                   # Laravel — Clean Architecture
│   ├── app/Http/...           # Presentation (controllers, requests)
│   ├── routes/api.php
│   └── src/
│       ├── Domain/            # Entities, Repositories (interfaces), Exceptions
│       ├── Application/       # UseCases, DTOs
│       └── Infrastructure/    # Eloquent models, repo impls, Providers (DI)
└── frontend/                  # React — Clean Architecture
    └── src/
        ├── domain/            # entities, repositories (interfaces)
        ├── application/       # useCases
        ├── infrastructure/    # HttpClient, repository implementations
        └── presentation/      # App, hooks, container (composition root)
```

## Clean Architecture — regra de dependência

As dependências sempre apontam para dentro. Camadas externas conhecem as internas, nunca o contrário:

```
Presentation ─▶ Application ─▶ Domain ◀─ Infrastructure
```

- **Domain**: regras de negócio puras, sem framework. Define as *interfaces* de repositório.
- **Application**: casos de uso que orquestram o domínio, recebendo dependências por interface.
- **Infrastructure**: implementações concretas (Eloquent, HTTP) das interfaces do domínio.
- **Presentation**: adaptadores de entrada (controllers HTTP no back, componentes React no front).

A inversão de dependência é feita no *composition root*:
- Backend → `src/Infrastructure/Providers/RepositoryServiceProvider.php`
- Frontend → `src/presentation/container.ts`

## Como rodar

Pré-requisitos: Docker + Docker Compose.

```bash
cp .env.example .env
docker compose up -d --build
```

Na primeira subida o container PHP instala as dependências do Composer, gera a `APP_KEY`, aguarda o MySQL e roda as migrations automaticamente (ver `docker/php/entrypoint.sh`).

Acesse:
- Frontend: http://localhost:5173
- API: http://localhost:8080/api/health

## Endpoints de exemplo (domínio `Seed`)

| Método | Rota              | Descrição                |
| ------ | ----------------- | ------------------------ |
| GET    | `/api/health`     | Healthcheck              |
| GET    | `/api/seeds`      | Lista as sementes        |
| POST   | `/api/seeds`      | Cria uma semente         |

```bash
curl -X POST http://localhost:8080/api/seeds \
  -H "Content-Type: application/json" \
  -d '{"title":"Primeira ideia","content":"Plantar todos os dias."}'
```

## Comandos úteis (Makefile)

```bash
make up          # sobe a stack
make logs        # acompanha os logs
make shell-php   # shell no container PHP
make migrate     # roda migrations
make test        # roda os testes do backend
make down        # derruba a stack
```

## CI/CD (GitHub Actions)

| Workflow | Arquivo | Dispara em | O que faz |
| -------- | ------- | ---------- | --------- |
| CI | `.github/workflows/ci.yml` | push/PR em `master` e `homolog` | Testa o backend (PHPUnit) e linta + builda o frontend |
| Deploy Homolog | `.github/workflows/deploy-homolog.yml` | push em `homolog` | `rsync` do código para o VPS + `docker compose -f docker-compose.prod.yml up -d --build` via SSH |

### Ambiente de produção

O deploy usa **arquivos Docker separados** (`docker-compose.prod.yml` + `docker/prod/`), diferentes do dev:

- **php**: código "assado" na imagem, `composer install --no-dev --optimize-autoloader`, caches de config/rota/view e OPcache com `validate_timestamps=0`.
- **web (nginx)**: build multi-stage que compila o React para estático e o serve; `/api` e `/up` são proxied para o php-fpm (mesma origem — sem CORS em produção).
- **mysql**: volume persistente.

### Secrets do repositório (Settings → Secrets and variables → Actions)

| Secret | Exemplo | Descrição |
| ------ | ------- | --------- |
| `SSH_HOST` | `123.45.67.89` | IP ou host do VPS |
| `SSH_USER` | `deploy` | Usuário de deploy no servidor |
| `SSH_PORT` | `22` | (opcional) porta SSH; default 22 |
| `SSH_PRIVATE_KEY` | *(chave privada)* | Chave do usuário `deploy` (a pública fica em `~/.ssh/authorized_keys` do servidor) |
| `DEPLOY_PATH` | `/home/deploy/mentis-semear` | Pasta do projeto no servidor |

### Setup inicial no servidor (uma vez)

```bash
# como usuário deploy, no VPS
mkdir -p /home/deploy/mentis-semear && cd /home/deploy/mentis-semear
cp .env.prod.example .env         # (ou crie manualmente) e preencha as senhas
# gere a APP_KEY e cole no .env:
docker compose -f docker-compose.prod.yml run --rm php php artisan key:generate --show
```

Depois é só `git push origin homolog` — o workflow sincroniza e sobe a stack. Aponte seu proxy reverso / HTTPS (Nginx, Traefik ou Caddy) do domínio `mentis.kassiosousa.com.br` para a porta `APP_PORT` (default `8080`) do container `web`.
