-- CreateTable
CREATE TABLE "OidcClient" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "secret" VARCHAR(255) NOT NULL,
    "redirectUris" TEXT[],
    "grantTypes" TEXT[] DEFAULT ARRAY['authorization_code']::TEXT[],
    "responseTypes" TEXT[] DEFAULT ARRAY['code']::TEXT[],
    "tokenEndpointAuthMethod" VARCHAR(50) NOT NULL DEFAULT 'client_secret_basic',
    "applicationType" VARCHAR(10) NOT NULL DEFAULT 'web',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "OidcClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "emailVerifiedAt" TIMESTAMPTZ,
    "passwordHash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
