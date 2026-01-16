import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import { existsSync, readFileSync } from "fs";

/**
 * Get the database url with the password from the environment variable if it exists.
 */
function getDatabaseUrl(): string {
  const passwordFile = process.env.POSTGRES_PASSWORD_FILE;

  if (passwordFile && existsSync(passwordFile)) {
    const password = readFileSync(passwordFile, "utf-8").trim();
    const encodedPassword = encodeURIComponent(password);
    return `postgresql://postgres:${encodedPassword}@javascript-example-database:5432/sample?schema=public`;
  }

  throw new Error("POSTGRES_PASSWORD_FILE is not set or does not exist.");
}

const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

export { prisma };
