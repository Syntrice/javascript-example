import "reflect-metadata";

import { Container } from "inversify";
import { InversifyExpressHttpAdapter } from "@inversifyjs/http-express-v4";
import { RootController } from "./controllers/root.controller.js";
import { UserController } from "./controllers/user.controller.js";
import { setupSwagger } from "./swagger.js";

const container: Container = new Container();

container.bind(RootController).toSelf().inSingletonScope();
container.bind(UserController).toSelf().inSingletonScope();

const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(container);

const app = await adapter.build();

// On development, enable swagger
if (process.env.NODE_ENV === "development") {
  setupSwagger(app);
}

const port = 3000;

app.listen(port, () => {
  console.log(`JavaScript Example Backend listing at http://localhost:3000`);
});
