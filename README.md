# JavaScript Example

A full-stack JavaScript application with a React frontend and Express backend, containerized with Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [pnpm](https://pnpm.io/installation) (if running locally without Docker)
- Node.js 18+ (if running locally without Docker)

## Getting Started with Docker

### Development Environment

1. **Start the development environment**:
   ```bash
   docker compose -f compose.dev.yaml watch
   ```

2. **Access the application**:
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend: [http://localhost:3000](http://localhost:3000)

3. **Hot reloading**: The frontend includes hot module replacement (HMR) via Vite. File changes will automatically sync to the container.

### Production Environment

1. **Build and start production containers**:
   ```bash
   docker compose -f compose.prod.yaml up --build
   ```

2. **Access the application**:
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
