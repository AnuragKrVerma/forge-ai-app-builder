/*
  Warnings:

  - You are about to drop the `CodeFregment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CodeFregment" DROP CONSTRAINT "CodeFregment_messageId_fkey";

-- DropTable
DROP TABLE "CodeFregment";

-- CreateTable
CREATE TABLE "CodeFragment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "sandboxUrl" TEXT NOT NULL,
    "sandboxId" VARCHAR(64) NOT NULL,
    "title" TEXT NOT NULL,
    "file" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodeFragment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodeFragment_messageId_key" ON "CodeFragment"("messageId");

-- AddForeignKey
ALTER TABLE "CodeFragment" ADD CONSTRAINT "CodeFragment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
