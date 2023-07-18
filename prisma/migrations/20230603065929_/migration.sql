-- CreateTable
CREATE TABLE "CourseTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CourseTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "courseTemplateId" INTEGER NOT NULL,

    CONSTRAINT "ModuleTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "objectives" TEXT NOT NULL,
    "moduleTemplateId" INTEGER NOT NULL,

    CONSTRAINT "TopicTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ModuleTemplate" ADD CONSTRAINT "ModuleTemplate_courseTemplateId_fkey" FOREIGN KEY ("courseTemplateId") REFERENCES "CourseTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicTemplate" ADD CONSTRAINT "TopicTemplate_moduleTemplateId_fkey" FOREIGN KEY ("moduleTemplateId") REFERENCES "ModuleTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
