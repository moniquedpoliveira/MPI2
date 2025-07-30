/*
  Warnings:

  - A unique constraint covering the columns `[contratoId,text]` on the table `ChecklistItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "contratos" ADD COLUMN     "identificacaoFiscalTec" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItem_contratoId_text_key" ON "ChecklistItem"("contratoId", "text");
