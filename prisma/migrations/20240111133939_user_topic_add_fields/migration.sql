/*
  Warnings:

  - Added the required column `completedExercisesDeveloping` to the `UserTopic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `completedExercisesProficient` to the `UserTopic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserTopic" ADD COLUMN     "completedExercisesDeveloping" BOOLEAN NOT NULL,
ADD COLUMN     "completedExercisesProficient" BOOLEAN NOT NULL;
