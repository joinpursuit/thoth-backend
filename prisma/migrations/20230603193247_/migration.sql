-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "classId" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Class" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassInvitation" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "ClassInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassMembership" (
    "userId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassMembership_userId_classId_key" ON "ClassMembership"("userId", "classId");

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassInvitation" ADD CONSTRAINT "ClassInvitation_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassMembership" ADD CONSTRAINT "ClassMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassMembership" ADD CONSTRAINT "ClassMembership_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
