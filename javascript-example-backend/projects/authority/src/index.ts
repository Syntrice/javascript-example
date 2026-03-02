import { Container } from "inversify";
import { InversifyExpressHttpAdapter } from "@inversifyjs/http-express-v4";
import { setupSwagger } from "./swagger.js";
import { CONFIG } from "./config.js";
import Provider from "oidc-provider";
import { OidcStorageAdapter } from "./services/oidc-storage-adapter.js";
import "./controllers/root.controller.js";
import { OidcProviderService } from "./services/oidc-provider.service.js";

const container: Container = new Container({ autobind: true });
container.bind(OidcProviderService).toSelf().inSingletonScope();
const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(container);

const app = await adapter.build();

// On development, enable swagger
if (CONFIG.server.environment === "development") {
  setupSwagger(app);
}

const provider = container.get(OidcProviderService).getProvider();
app.use(`/oidc`, provider.callback());

app.listen(CONFIG.server.port, () => {
  console.log(`JavaScript Example Backend Authority listing at ${CONFIG.server.rootAddress}`);
});
