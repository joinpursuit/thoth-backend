/*
  Warnings:

  - Added the required column `objectives` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "objectives" TEXT NOT NULL;
