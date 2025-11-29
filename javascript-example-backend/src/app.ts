import { injectable } from "inversify";
import express, { type Application } from "express";

@injectable()
export class App {
  private app: Application;

  public constructor() {
    this.app = express();

    this.app.get("/", (req, res) => {
      res.send("Hello World!");
    });
  }

  public run(): void {
    const port = 3000;

    this.app.listen(port, () => {
      console.log(`JavaScript Example Backend listing at http://localhost:3000`);
    });
  }
}
