# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.19.0
ARG NGINX_VERSION=alpine3.22

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

# Copy frontend files
COPY javascript-example-frontend/ ./javascript-example-frontend/

# Install all dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --filter "@javascript-example-frontend..." --frozen-lockfile

# Run the build
RUN pnpm --filter "@javascript-example-frontend" run build

#---------------------------
#     RUNNER STAGE
#---------------------------

FROM nginxinc/nginx-unprivileged:${NGINX_VERSION} AS runner

# Use built-in non-root user
USER nginx

# Copy custom Nginx config
COPY javascript-example-frontend/nginx.conf /etc/nginx/nginx.conf

# Copy the static build output from the build stage
COPY --chown=nginx:nginx --from=build /usr/src/app/javascript-example-frontend/dist /usr/share/nginx/html

# Expose port 8080 (nginx-unprivileged default)
EXPOSE 8080

# Start Nginx
ENTRYPOINT ["nginx", "-c", "/etc/nginx/nginx.conf"]
CMD ["-g", "daemon off;"]
