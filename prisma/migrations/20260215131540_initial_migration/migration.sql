/*
  Warnings:

  - You are about to drop the column `file` on the `CodeFragment` table. All the data in the column will be lost.
  - Added the required column `files` to the `CodeFragment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CodeFragment" DROP COLUMN "file",
ADD COLUMN     "files" JSONB NOT NULL;
