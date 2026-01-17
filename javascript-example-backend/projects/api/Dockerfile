# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.19.0

#---------------------------
#     BASE STAGE
#---------------------------

FROM node:${NODE_VERSION}-alpine AS base

# Set env variables
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Use corepack to handle pnpm
RUN corepack enable

# Set working directory
WORKDIR /usr/src/app

#---------------------------
#     BUILD STAGE
#---------------------------

FROM base AS build

# Copy monorepo root files and workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy shared backend files
COPY javascript-example-backend/*.* ./javascript-example-backend/

# Copy api project files
COPY javascript-example-backend/projects/api/ ./javascript-example-backend/projects/api/

# Install all dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --filter "@javascript-example-backend/api..." --frozen-lockfile

# Generate Prisma client and build (using BuildKit secret for database password)
RUN --mount=type=secret,id=postgres_password \
  POSTGRES_PASSWORD_FILE=/run/secrets/postgres_password \
  pnpm --filter "@javascript-example-backend/api" run build

#---------------------------
#     RUNNER STAGE
#---------------------------

FROM base AS runner

# Use production node environment
ENV NODE_ENV=production

# Run as non-root user
USER node

# Copy monorepo root files
COPY --chown=node:node package.json pnpm-workspace.yaml ./

# Copy backend workspace package.json
COPY --chown=node:node javascript-example-backend/*.* ./javascript-example-backend/

# Copy api project package.json
COPY --chown=node:node javascript-example-backend/projects/api/package.json ./javascript-example-backend/projects/api/

# Copy production dependencies from build stage
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/javascript-example-backend/node_modules ./javascript-example-backend/node_modules
COPY --chown=node:node --from=build /usr/src/app/javascript-example-backend/projects/api/node_modules ./javascript-example-backend/projects/api/node_modules

# Copy built application
COPY --chown=node:node --from=build /usr/src/app/javascript-example-backend/projects/api/dist ./javascript-example-backend/projects/api/dist

# Copy generated Prisma client
COPY --chown=node:node --from=build /usr/src/app/javascript-example-backend/projects/api/generated ./javascript-example-backend/projects/api/generated

# Expose the port
EXPOSE 3000

# Run the application
CMD ["pnpm", "--filter", "@javascript-example-backend/api", "run", "start"]
