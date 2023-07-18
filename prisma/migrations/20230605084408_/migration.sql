/*
  Warnings:

  - Added the required column `testData` to the `Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatMessage" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "testData" TEXT NOT NULL;
