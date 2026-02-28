import type {
  Adapter,
  AdapterPayload,
  ClientAuthMethod,
  ClientMetadata,
  ResponseType,
} from "oidc-provider";
import { prisma } from "@javascript-example-backend/common";
import { Redis } from "ioredis";
import { CONFIG } from "../config.js";

const redisClient = new Redis(CONFIG.database.redisUrl);
redisClient.on("error", (err) => console.log("Redis Client Error", err));

const grantable = new Set([
  "AccessToken",
  "AuthorizationCode",
  "RefreshToken",
  "DeviceCode",
  "BackchannelAuthenticationRequest",
]);

const consumable = new Set([
  "AuthorizationCode",
  "RefreshToken",
  "DeviceCode",
  "BackchannelAuthenticationRequest",
  "PushedAuthorizationRequest",
]);

function grantKeyFor(id: string): string {
  return `grant:${id}`;
}

function userCodeKeyFor(userCode: string): string {
  return `userCode:${userCode}`;
}

function uidKeyFor(uid: string): string {
  return `uid:${uid}`;
}

export class OidcStorageAdapter implements Adapter {
  // The name parameter here is set by oidc-provider, which instatiates a
  // different instance per the model type. E.g.
  // new RedisAdapter("Client")      // for client lookups
  // new RedisAdapter("Session")     // for sessions
  // new RedisAdapter("AccessToken") // for access tokens
  // new RedisAdapter("Grant")       // for grants

  constructor(private readonly name: string) {}

  async upsert(id: string, payload: AdapterPayload, expiresIn: number): Promise<void> {
    if (this.name === "Client") return;

    const key = this.key(id);

    const multi = redisClient.multi();
    if (consumable.has(this.name)) {
      // Store as a hash structure so we can add the consumed field
      multi.hset(key, { payload: JSON.stringify(payload) });
    } else {
      // Non consumable tokens don't need a consumed field added,
      // so store them as a simple string set
      multi.set(key, JSON.stringify(payload));
    }

    if (expiresIn) {
      // Set expirary for redis key
      multi.expire(key, expiresIn);
    }

    // If model type is grantable then push the model (token type) to
    // a redis list under the grant key for grantId
    if (grantable.has(this.name) && payload.grantId) {
      const grantKey = grantKeyFor(payload.grantId);
      multi.rpush(grantKey, key);
      // if you're seeing grant key lists growing out of acceptable proportions consider using LTRIM
      // here to trim the list to an appropriate length
      const ttl = await redisClient.ttl(grantKey);
      if (expiresIn > ttl) {
        multi.expire(grantKey, expiresIn);
      }
    }

    // If includes a user code, store lookup to device code
    if (payload.userCode) {
      const userCodeKey = userCodeKeyFor(payload.userCode);
      multi.set(userCodeKey, id);
      multi.expire(userCodeKey, expiresIn);
    }

    // If includes unique identifier, map to the device code
    if (payload.uid) {
      const uidKey = uidKeyFor(payload.uid);
      multi.set(uidKey, id);
      multi.expire(uidKey, expiresIn);
    }

    await multi.exec();
  }

  async find(id: string): Promise<AdapterPayload | undefined> {
    // For client models, query our main database for all clients
    if (this.name === "Client") {
      const client = await prisma.oidcClient.findUnique({ where: { id } });
      if (!client) return undefined;

      const metadata: ClientMetadata = {
        client_id: client.id,
        client_name: client.name,
        client_secret: client.secret,
        redirect_uris: client.redirectUris,
        grant_types: client.grantTypes,
        response_types: client.responseTypes as ResponseType[],
        token_endpoint_auth_method: client.tokenEndpointAuthMethod as ClientAuthMethod,
        application_type: client.applicationType as "web" | "native",
      };

      return metadata;
    }

    // For consumable models
    if (consumable.has(this.name)) {
      const data = await redisClient.hgetall(this.key(id));
      if (!data || Object.keys(data).length === 0) return undefined;
      const { payload, ...rest } = data;
      if (!payload) throw new Error(`Corrupted data: missing payload for ${this.key(id)}`);
      return { ...rest, ...JSON.parse(payload) };
    }

    const data = await redisClient.get(this.key(id));
    if (!data) return undefined;
    return JSON.parse(data);
  }

  async findByUserCode(userCode: string): Promise<AdapterPayload | undefined> {
    const id = await redisClient.get(userCodeKeyFor(userCode));
    if (!id) return undefined;
    return this.find(id);
  }

  async findByUid(uid: string): Promise<AdapterPayload | undefined> {
    const id = await redisClient.get(uidKeyFor(uid));
    if (!id) return undefined;
    return this.find(id);
  }

  async consume(id: string): Promise<void> {
    await redisClient.hset(this.key(id), "consumed", Math.floor(Date.now() / 1000));
  }

  async destroy(id: string): Promise<void> {
    if (this.name === "Client") return;
    const key = this.key(id);
    await redisClient.del(key);
  }

  async revokeByGrantId(grantId: string): Promise<void> {
    // Get all tokens attached to grant id and delete all. Finally delete the grant itself
    const multi = redisClient.multi();
    const tokens = await redisClient.lrange(grantKeyFor(grantId), 0, -1);
    tokens.forEach((token) => multi.del(token));
    multi.del(grantKeyFor(grantId));
    await multi.exec();
  }

  private key(id: string): string {
    return `${this.name}:${id}`;
  }
}
