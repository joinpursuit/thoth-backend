/*
  Warnings:

  - You are about to drop the column `completedExercisesDeveloping` on the `UserTopic` table. All the data in the column will be lost.
  - You are about to drop the column `completedExercisesProficient` on the `UserTopic` table. All the data in the column will be lost.
  - Added the required column `lastSeen` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastSeen" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserTopic" DROP COLUMN "completedExercisesDeveloping",
DROP COLUMN "completedExercisesProficient";
