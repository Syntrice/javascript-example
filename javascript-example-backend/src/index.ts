import "reflect-metadata";

import { Container } from "inversify";
import { InversifyExpressHttpAdapter } from "@inversifyjs/http-express-v4";
import { RootController } from "./controllers/root.controller.js";

const container: Container = new Container();

container.bind(RootController).toSelf().inSingletonScope();

const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(container);

const app = await adapter.build();

const port = 3000;

app.listen(port, () => {
  console.log(`JavaScript Example Backend listing at http://localhost:3000`);
});
