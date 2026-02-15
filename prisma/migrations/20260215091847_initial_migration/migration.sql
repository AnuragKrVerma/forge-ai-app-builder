-- AlterTable
ALTER TABLE "CodeFragment" ALTER COLUMN "sandboxId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "sandboxId" DROP NOT NULL;
