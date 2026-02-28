import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  REDIS_URL: z.url().default("redis://javascript-example-redis:6379"),
});

const environment = environmentSchema.parse(process.env);

// TODO: For inversion of dependencies extract to injectable class and interface
export const CONFIG = {
  oidc: {
    issuer: `http://localhost:${environment.PORT}`,
  },
  server: {
    environment: environment.NODE_ENV,
    port: environment.PORT,
    rootAddress: `http://localhost:${environment.PORT}`,
  },
  database: {
    redisUrl: environment.REDIS_URL,
  },
} as const;
