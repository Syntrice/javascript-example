import { Controller, Get } from "@inversifyjs/http-core";

/**
 * @openapi
 * /:
 *   get:
 *     tags:
 *       - Root
 *     description: Returns "Hello World!"
 *     responses:
 *       200:
 *         description: Returns "Hello World!"
 */
@Controller("/")
export class RootController {
  @Get()
  public sayHello(): string {
    return "Hello World!";
  }
}
