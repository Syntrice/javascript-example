import type {
  Adapter,
  AdapterPayload,
  ClientAuthMethod,
  ClientMetadata,
  ResponseType,
} from "oidc-provider";
import { prisma } from "@javascript-example-backend/common";

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
    throw new Error("Method not implemented.");
  }

  async find(id: string): Promise<AdapterPayload | undefined> {
    // For client models, query our main database for all clients
    // and map to the
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

    throw new Error("Method not implemented.");
  }

  async findByUserCode(userCode: string): Promise<AdapterPayload | undefined> {
    throw new Error("Method not implemented.");
  }

  async findByUid(uid: string): Promise<AdapterPayload | undefined> {
    throw new Error("Method not implemented.");
  }

  async consume(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async destroy(id: string): Promise<void> {
    if (this.name === "Client") return;
    throw new Error("Method not implemented.");
  }

  async revokeByGrantId(grantId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
