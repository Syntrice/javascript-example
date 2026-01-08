# JavaScript Example

A full-stack JavaScript application with a React frontend and Express backend, containerized with
Docker.

This repo is supposed to serve as a reference to myself and others wishing to create a full-stack typescript 
monorepo setup. The commit history provides a breakdown of setup instructions, from the ground up. 

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [pnpm](https://pnpm.io/installation) (if running locally without Docker)
- Node.js 18+ (if running locally without Docker)

## Getting Started with Docker

### Development Environment

1. **Configure secrets**: See [here](secrets/README.md) for more info

2. **Start the development environment**:

   ```bash
   docker compose -f compose.dev.yaml watch
   ```

3. **Access the application**:

   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend: [http://localhost:3000](http://localhost:3000)

4. **Hot reloading**: The frontend includes hot module replacement (HMR) via Vite. File changes will
   automatically sync to the container.

Note that this project also has a `justfile`. If you have [Just](https://just.systems) installed, 
run `just --list` in the repository root for a list of commands.

### Production Environment

1. **Configure secrets**: See [here](secrets/README.md) for more info

2. **Build and start production containers**:

   ```bash
   docker compose -f compose.prod.yaml up --build
   ```

3. **Access the application**:
   - Frontend: [http://localhost:8080](http://localhost:8080)
   - Backend: [http://localhost:3000](http://localhost:3000)

## Getting started without Docker

### Backend

1. **Install backend dependencies**:

   ```bash
   cd javascript-example-backend
   pnpm install
   ```

2. **Available scripts**

- `pnpm dev` - Compile TypeScript and start the server
- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm start` - Run the compiled application
- `pnpm lint` - Run ESLint

### Frontend

1. **Install frontend dependencies**:

   ```bash
   cd javascript-example-frontend
   pnpm install
   ```

2. **Available scripts**

- `pnpm dev` - Start Vite development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally
- `pnpm lint` - Run ESLint

## Working with Prisma

### With Docker

Prisma is setup to be run through docker. Bind mounts are also setup so that migrations and client
generated through docker are copied to the development folder.

Available scripts:

- Generate migration: `docker compose -f compose.dev.yaml exec javascript-example-backend pnpm prisma:generate`
- Open prisma studio: `docker compose -f compose.dev.yaml exec javascript-example-backend pnpm prisma:studio`
