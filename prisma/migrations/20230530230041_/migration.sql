/*
  Warnings:

  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "level",
DROP COLUMN "password",
ADD COLUMN     "firebaseId" TEXT;

-- CreateTable
CREATE TABLE "UserTopic" (
    "user_id" INTEGER NOT NULL,
    "topic_id" INTEGER NOT NULL,
    "level" "UserLevel" NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTopic_user_id_topic_id_key" ON "UserTopic"("user_id", "topic_id");

-- AddForeignKey
ALTER TABLE "UserTopic" ADD CONSTRAINT "UserTopic_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTopic" ADD CONSTRAINT "UserTopic_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
