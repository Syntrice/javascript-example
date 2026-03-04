import "reflect-metadata";

import { Container } from "inversify";
import { InversifyExpressHttpAdapter } from "@inversifyjs/http-express-v4";
import { RootController } from "./controllers/root.controller.js";
import { UserController } from "./controllers/user.controller.js";
import { setupSwagger } from "./swagger.js";
import { createAuthMiddleware } from "@javascript-example-backend/common";

const container: Container = new Container();

container.bind(RootController).toSelf().inSingletonScope();
container.bind(UserController).toSelf().inSingletonScope();

const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(container);

const app = await adapter.build();

// Protect API routes with JWT auth middleware
const authorityUrl = process.env.AUTHORITY_URL || "http://localhost:3001";
app.use(
  createAuthMiddleware({
    jwksUri: `${authorityUrl}/oidc/jwks`,
    issuer: `${process.env.ISSUER || "http://localhost:3001"}/oidc`,
  }),
);

// On development, enable swagger
if (process.env.NODE_ENV === "development") {
  setupSwagger(app);
}

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`JavaScript Example Backend API listening at http://localhost:${port}`);
});
