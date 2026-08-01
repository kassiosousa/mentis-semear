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
