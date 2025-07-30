/*
  Warnings:

  - A unique constraint covering the columns `[text,type]` on the table `Checklist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Checklist_text_type_key" ON "Checklist"("text", "type");
