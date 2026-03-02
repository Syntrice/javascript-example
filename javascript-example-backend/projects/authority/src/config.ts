import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  REDIS_URL: z.url().default("redis://javascript-example-redis:6379"),
  ACCESS_TOKEN_LIFETIME: z.coerce.number().default(60 * 60), // 1 hour
  AUTHORIZATION_CODE_LIFETIME: z.coerce.number().default(60), // 1 minute
  BACKCHANNEL_AUTHENTICATION_REQUEST_LIFETIME: z.coerce.number().default(10 * 60), // 10 minutes
  CLIENT_CREDENTIALS_LIFETIME: z.coerce.number().default(10 * 60), // 10 minutes
  DEVICE_CODE_LIFETIME: z.coerce.number().default(10 * 60), // 10 minutes
  GRANT_LIFETIME: z.coerce.number().default(14 * 24 * 60 * 60), // 14 days
  ID_TOKEN_LIFETIME: z.coerce.number().default(60 * 60), // 1 hour
  INTERACTION_LIFETIME: z.coerce.number().default(60 * 60), // 1 hour
  REFRESH_TOKEN_LIFETIME: z.coerce.number().default(14 * 24 * 60 * 60), // 14 days
  SESSION_LIFETIME: z.coerce.number().default(14 * 24 * 60 * 60), // 14 days
});

const environment = environmentSchema.parse(process.env);

// TODO: For inversion of dependencies extract to injectable class and interface
export const CONFIG = {
  oidc: {
    issuer: `http://localhost:${environment.PORT}`,
    accessTokenLifetime: environment.ACCESS_TOKEN_LIFETIME,
    authorizationCodeLifetime: environment.AUTHORIZATION_CODE_LIFETIME,
    backchannelAuthenticationRequestLifetime: environment.BACKCHANNEL_AUTHENTICATION_REQUEST_LIFETIME,
    clientCredentialsLifetime: environment.CLIENT_CREDENTIALS_LIFETIME,
    deviceCodeLifetime: environment.DEVICE_CODE_LIFETIME,
    grantLifetime: environment.GRANT_LIFETIME,
    idTokenLifetime: environment.ID_TOKEN_LIFETIME,
    interactionLifetime: environment.INTERACTION_LIFETIME,
    refreshTokenLifetime: environment.REFRESH_TOKEN_LIFETIME,
    sessionLifetime: environment.SESSION_LIFETIME,
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
