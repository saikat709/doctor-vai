CREATE TABLE IF NOT EXISTS "LocalLLMConfig" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "tunnelUrl" TEXT NOT NULL,
  "selectedModel" TEXT NOT NULL,
  "verifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "LocalLLMConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LocalLLMConfig_userId_key" ON "LocalLLMConfig"("userId");

ALTER TABLE "LocalLLMConfig"
ADD CONSTRAINT "LocalLLMConfig_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
