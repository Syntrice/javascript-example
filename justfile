# Development commands for javascript-example

# Run command in backend container
be *args:
    docker compose -f compose.dev.yaml exec javascript-example-backend-api {{args}}

# Run pnpm command in backend api package
be-api *args:
    docker compose -f compose.dev.yaml exec javascript-example-backend-api pnpm --filter @javascript-example-backend/api {{args}}

# Run command in frontend container
fe *args:
    docker compose -f compose.dev.yaml exec javascript-example-frontend {{args}}

# Start all services
up:
    docker compose -f compose.dev.yaml up

# Start all services (rebuild)
up-build:
    docker compose -f compose.dev.yaml up --build

# Stop all services
down:
    docker compose -f compose.dev.yaml down

# Prisma generate
prisma-generate:
    just be-api prisma:generate

# Prisma migrate dev
prisma-migrate:
    just be-api prisma:migrate:dev

# Prisma studio
prisma-studio:
    just be-api prisma:studio
