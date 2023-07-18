/*
  Warnings:

  - You are about to drop the column `exerciseId` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `isHuman` on the `ChatMessage` table. All the data in the column will be lost.
  - Added the required column `submissionId` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_exerciseId_fkey";

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "exerciseId",
DROP COLUMN "isHuman",
ADD COLUMN     "submissionId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Submission" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "passing" BOOLEAN NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
