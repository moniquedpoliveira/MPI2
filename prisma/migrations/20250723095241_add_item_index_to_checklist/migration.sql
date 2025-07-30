/*
  Warnings:

  - A unique constraint covering the columns `[contratoId,itemIndex]` on the table `ChecklistItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `itemIndex` to the `ChecklistItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ChecklistItem_contratoId_text_key";

-- AlterTable
ALTER TABLE "ChecklistItem" ADD COLUMN     "itemIndex" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItem_contratoId_itemIndex_key" ON "ChecklistItem"("contratoId", "itemIndex");
