# Development commands for javascript-example

# Run command in backend container
be *args:
    docker compose -f compose.dev.yaml exec javascript-example-backend-api {{args}}

# Run pnpm command in backend api package
be-api *args:
    docker compose -f compose.dev.yaml exec javascript-example-backend-api pnpm --filter @javascript-example-backend/api {{args}}

be-authority *args:
    docker compose -f compose.dev.yaml exec javascript-example-backend-authority pnpm --filter @javascript-example-backend/authority {{args}}

# Run pnpm command in db-tools container (for prisma commands)
db *args:
    docker compose -f compose.dev.yaml exec javascript-example-db-tools pnpm --filter @javascript-example-backend/common {{args}}

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

drop:
    docker compose -f compose.dev.yaml down -v

# Prisma generate
prisma-generate:
    just db prisma:generate

# Prisma migrate dev
prisma-migrate:
    just db prisma:migrate:dev

# Prisma reset (drops database and recreates)
prisma-reset:
    just db exec prisma migrate reset
