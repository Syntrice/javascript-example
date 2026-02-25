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

# Copy common package (dependency)
COPY javascript-example-backend/projects/common/ ./javascript-example-backend/projects/common/

# Copy authority project files
COPY javascript-example-backend/projects/authority/ ./javascript-example-backend/projects/authority/

# Install all dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --filter "@javascript-example-backend/authority..." --frozen-lockfile

# Build common first (prisma generate + tsc), then build authority
RUN pnpm --filter "@javascript-example-backend/common" run build && \
  pnpm --filter "@javascript-example-backend/authority" run build

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

# Copy common project package.json
COPY --chown=node:node javascript-example-backend/projects/common/package.json ./javascript-example-backend/projects/common/

# Copy authority project package.json
COPY --chown=node:node javascript-example-backend/projects/authority/package.json ./javascript-example-backend/projects/authority/

# Copy production dependencies from build stage
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/javascript-example-backend/projects/common/node_modules ./javascript-example-backend/projects/common/node_modules
COPY --chown=node:node --from=build /usr/src/app/javascript-example-backend/projects/authority/node_modules ./javascript-example-backend/projects/authority/node_modules

# Copy built common (dist + generated Prisma client)
COPY --chown=node:node --from=build /usr/src/app/javascript-example-backend/projects/common/dist ./javascript-example-backend/projects/common/dist
COPY --chown=node:node --from=build /usr/src/app/javascript-example-backend/projects/common/generated ./javascript-example-backend/projects/common/generated

# Copy built authority
COPY --chown=node:node --from=build /usr/src/app/javascript-example-backend/projects/authority/dist ./javascript-example-backend/projects/authority/dist

# Expose the port
EXPOSE 3001

# Run the application
CMD ["pnpm", "--filter", "@javascript-example-backend/authority", "run", "start"]
