import { prisma } from "../index.js";
import bcrypt from "bcrypt";

async function seed() {
  // Create test user
  const passwordHash = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      passwordHash,
    },
  });
  console.log(`Seeded user: ${user.email} (${user.id})`);

  // Create dev OIDC client (stable UUID for idempotent seeding)
  const DEV_CLIENT_ID = "00000000-0000-4000-a000-000000000001";
  const client = await prisma.oidcClient.upsert({
    where: { id: DEV_CLIENT_ID },
    update: {},
    create: {
      id: DEV_CLIENT_ID,
      name: "Development Client",
      secret: "dev-secret",
      redirectUris: ["http://localhost:5173/callback"],
      grantTypes: ["authorization_code", "refresh_token"],
      responseTypes: ["code"],
      tokenEndpointAuthMethod: "client_secret_basic",
      applicationType: "web",
    },
  });
  console.log(`Seeded OIDC client: ${client.name} (${client.id})`);
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
