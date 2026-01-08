import { Body, Controller, Get, Post } from "@inversifyjs/http-core";
import { prisma } from "../database/prisma-client.js";
import type { User } from "../../generated/prisma/index.js";

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
 *   post:
 *     tags:
 *       - Users
 *     description: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */
@Controller("/users")
export class UserController {
  @Get()
  public async getUsers(): Promise<User[]> {
    return prisma.user.findMany();
  }

  @Post()
  public async createUser(
    @Body() body: { email: string; name?: string },
  ): Promise<User> {
    const { email, name } = body;
    return prisma.user.create({
      data: {
        email,
        ...(name !== undefined && { name }),
      },
    });
  }
}
