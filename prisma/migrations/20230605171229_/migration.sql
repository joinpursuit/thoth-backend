-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "submissionId" INTEGER;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
