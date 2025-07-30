/*
  Warnings:

  - You are about to drop the column `dataEsclarecimento` on the `ChecklistItem` table. All the data in the column will be lost.
  - You are about to drop the column `dataResposta` on the `ChecklistItem` table. All the data in the column will be lost.
  - You are about to drop the column `dataVerificacao` on the `ChecklistItem` table. All the data in the column will be lost.
  - You are about to drop the column `esclarecimento` on the `ChecklistItem` table. All the data in the column will be lost.
  - You are about to drop the column `itemIndex` on the `ChecklistItem` table. All the data in the column will be lost.
  - You are about to drop the column `observacao` on the `ChecklistItem` table. All the data in the column will be lost.
  - You are about to drop the column `resposta` on the `ChecklistItem` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `ChecklistItem` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ChecklistItem` table. All the data in the column will be lost.
  - You are about to drop the column `verificadoPorId` on the `ChecklistItem` table. All the data in the column will be lost.
  - Added the required column `checklistId` to the `ChecklistItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChecklistItem" DROP CONSTRAINT "ChecklistItem_verificadoPorId_fkey";

-- DropIndex
DROP INDEX "ChecklistItem_contratoId_idx";

-- DropIndex
DROP INDEX "ChecklistItem_contratoId_itemIndex_key";

-- DropIndex
DROP INDEX "ChecklistItem_verificadoPorId_idx";

-- AlterTable
ALTER TABLE "ChecklistItem" DROP COLUMN "dataEsclarecimento",
DROP COLUMN "dataResposta",
DROP COLUMN "dataVerificacao",
DROP COLUMN "esclarecimento",
DROP COLUMN "itemIndex",
DROP COLUMN "observacao",
DROP COLUMN "resposta",
DROP COLUMN "text",
DROP COLUMN "type",
DROP COLUMN "verificadoPorId",
ADD COLUMN     "checklistId" TEXT NOT NULL,
ADD COLUMN     "currentObservation" TEXT,
ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "Checklist" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" "ChecklistType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObservationHistory" (
    "id" TEXT NOT NULL,
    "checklistItemId" TEXT NOT NULL,
    "status" "ChecklistItemStatus" NOT NULL,
    "observation" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ObservationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Esclarecimento" (
    "id" TEXT NOT NULL,
    "checklistItemId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "askedById" TEXT NOT NULL,
    "answer" TEXT,
    "answeredById" TEXT,
    "askedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answeredAt" TIMESTAMP(3),
    "userId" TEXT,

    CONSTRAINT "Esclarecimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "checklistItemId" TEXT,
    "esclarecimentoId" TEXT,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObservationHistory" ADD CONSTRAINT "ObservationHistory_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "ChecklistItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObservationHistory" ADD CONSTRAINT "ObservationHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Esclarecimento" ADD CONSTRAINT "Esclarecimento_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "ChecklistItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Esclarecimento" ADD CONSTRAINT "Esclarecimento_askedById_fkey" FOREIGN KEY ("askedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Esclarecimento" ADD CONSTRAINT "Esclarecimento_answeredById_fkey" FOREIGN KEY ("answeredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Esclarecimento" ADD CONSTRAINT "Esclarecimento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "ChecklistItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_esclarecimentoId_fkey" FOREIGN KEY ("esclarecimentoId") REFERENCES "Esclarecimento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
