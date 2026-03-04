import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import type { Request, Response, NextFunction } from "express";

export interface AuthMiddlewareOptions {
  /** JWKS endpoint URL, e.g. http://authority:3001/oidc/jwks */
  jwksUri: string;
  /** Expected issuer, e.g. http://localhost:3001/oidc */
  issuer: string;
  /** Expected audience (optional — omit to skip audience check) */
  audience?: string;
}

export interface AuthenticatedRequest extends Request {
  auth: {
    sub: string;
    payload: JWTPayload;
  };
}

export function createAuthMiddleware(options: AuthMiddlewareOptions) {
  const jwks = createRemoteJWKSet(new URL(options.jwksUri));

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid Authorization header" });
      return;
    }

    const token = header.slice(7);

    try {
      const { payload } = await jwtVerify(token, jwks, {
        issuer: options.issuer,
        ...(options.audience && { audience: options.audience }),
      });

      if (!payload.sub) {
        res.status(401).json({ error: "Token missing sub claim" });
        return;
      }

      (req as AuthenticatedRequest).auth = {
        sub: payload.sub,
        payload,
      };

      next();
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}
