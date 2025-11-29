import "reflect-metadata";

import { Container } from "inversify";
import { App } from "./app.js";

const container: Container = new Container();

container.bind(App).toSelf();

const application = container.get<App>(App);
application.run();
