import "reflect-metadata";
import { Container } from "inversify";
import { InversifyExpressHttpAdapter } from "@inversifyjs/http-express-v4";
import { setupSwagger } from "./swagger.js";
import { CONFIG } from "./config.js";
import "./controllers/root.controller.js";
import { OidcProviderService } from "./services/oidc-provider.service.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { urlencoded } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const container: Container = new Container({ autobind: true });
container.bind(OidcProviderService).toSelf().inSingletonScope();
const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(container);

const app = await adapter.build();

// Configure EJS view engine
app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));

// Parse URL-encoded form bodies (for login / consent form submissions)
app.use(urlencoded({ extended: false }));

// On development, enable swagger
if (CONFIG.server.environment === "development") {
  setupSwagger(app);
}

// Mount oidc-provider endpoints
const provider = container.get(OidcProviderService).provider;
app.use(`/oidc`, provider.callback());

app.listen(CONFIG.server.port, () => {
  console.log(`JavaScript Example Backend Authority listening at ${CONFIG.server.rootAddress}`);
});
