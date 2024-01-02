/*
  Warnings:

  - You are about to drop the column `content` on the `Submission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "content";

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isFolder" BOOLEAN NOT NULL,
    "submissionId" INTEGER NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
