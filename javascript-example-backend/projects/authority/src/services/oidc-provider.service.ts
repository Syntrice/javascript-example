import { injectable, inject } from "inversify";
import Provider, { type Configuration } from "oidc-provider";
import { OidcStorageAdapter } from "./oidc-storage-adapter.js";
import { AccountService } from "./account.service.js";
import { CONFIG } from "../config.js";

@injectable()
export class OidcProviderService {
  private _provider: Provider;

  constructor(@inject(AccountService) private readonly accountService: AccountService) {
    this._provider = new Provider(CONFIG.oidc.issuer, this.configuration);
  }

  get configuration(): Configuration {
    return {
      adapter: OidcStorageAdapter,
      // Register optional claims (things like sub, iss, and aud are handled automatically)
      claims: {
        email: ["email", "email_verified"],
      },
      // TODO: Might need this later when we configure the frontend
      // clientBasedCORS: (ctx, origin, client) => {},
      clients: [], // Clients are connected in database, but we can hardcode them here
      features: {
        devInteractions: { enabled: CONFIG.server.environment === "development" },
        // resourceIndicators: {} We need this if we ever add multiple APIs or third party resources (i.e. apache superset)
        clientCredentials: { enabled: true }, // Allows backend services with no user context to authenticate
        // features.registration, // If we ever add runtime client registration we need this,
        revocation: { enabled: true }, // enable token revocation endpoint
        rpInitiatedLogout: {
          enabled: true,
          // logoutSource - specify this to set logout HTML page
        },
      },
      findAccount: (_ctx, id) => this.accountService.findAccount(id),
      interactions: {
        url: (_ctx, interaction) => `/interaction/${interaction.uid}`,
        // policy: Specify policy to customize steps extra stepssuch as MFA, consent, etc
      },
      // TODO: Specify this when we want to persist jwks on service restart (i.e. in production)
      // oidc-provider will generate ones for you but this we need to configure persistance for
      // production,
      // jwks: {}
      ttl: {
        AccessToken: (_ctx, token, _client) =>
          token.resourceServer?.accessTokenTTL || CONFIG.oidc.accessTokenLifetime,
        AuthorizationCode: CONFIG.oidc.authorizationCodeLifetime,
        BackchannelAuthenticationRequest: (ctx, _request, _client) => {
          if (ctx?.oidc?.params?.requested_expiry) {
            return Math.min(CONFIG.oidc.backchannelAuthenticationRequestLifetime, +ctx.oidc.params.requested_expiry);
          }

          return CONFIG.oidc.backchannelAuthenticationRequestLifetime;
        },
        ClientCredentials: (_ctx, token, _client) =>
          token.resourceServer?.accessTokenTTL || CONFIG.oidc.clientCredentialsLifetime,
        DeviceCode: CONFIG.oidc.deviceCodeLifetime,
        Grant: CONFIG.oidc.grantLifetime,
        IdToken: CONFIG.oidc.idTokenLifetime,
        Interaction: CONFIG.oidc.interactionLifetime,
        RefreshToken: (ctx, token, client) => {
          if (
            ctx?.oidc?.entities.RotatedRefreshToken &&
            client.applicationType === "web" &&
            client.clientAuthMethod === "none" &&
            !token.isSenderConstrained()
          ) {
            // Non-Sender Constrained SPA RefreshTokens do not have infinite expiration through rotation
            return ctx.oidc.entities.RotatedRefreshToken.remainingTTL;
          }

          return CONFIG.oidc.refreshTokenLifetime;
        },
        Session: CONFIG.oidc.sessionLifetime,
      },
      // TODO: Specify this when we want to persist cookies on service restart (i.e. in production)
      // oidc-provider will generate ones for you but this we need to configure persistance for
      // production,
      // cookies: {
      //   keys:
      // }
    };
  }

  get provider(): Provider {
    return this._provider;
  }
}
