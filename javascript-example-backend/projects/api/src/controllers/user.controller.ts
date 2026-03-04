import { Controller, Get } from "@inversifyjs/http-core";
import { prisma, type User } from "@javascript-example-backend/common";

/**
 * @openapi
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns all users
 *     responses:
 *       200:
 *         description: List of users
 */
@Controller("/users")
export class UserController {
  @Get()
  public async getUsers(): Promise<User[]> {
    return prisma.user.findMany();
  }
}
