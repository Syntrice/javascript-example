import { Controller, Get } from "@inversifyjs/http-core";

@Controller("/")
export class RootController {
  @Get()
  public sayHello(): string {
    return "Hello World!";
  }
}
