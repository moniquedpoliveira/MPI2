-- CreateEnum
CREATE TYPE "ChecklistItemStatus" AS ENUM ('PENDENTE', 'CONFORME', 'NAO_CONFORME');

-- CreateEnum
CREATE TYPE "ChecklistType" AS ENUM ('ADMINISTRATIVA', 'TECNICA');

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" "ChecklistType" NOT NULL,
    "status" "ChecklistItemStatus" NOT NULL DEFAULT 'PENDENTE',
    "dataVerificacao" TIMESTAMP(3),
    "verificadoPorId" TEXT,
    "esclarecimento" TEXT,
    "dataEsclarecimento" TIMESTAMP(3),
    "resposta" TEXT,
    "dataResposta" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChecklistItem_contratoId_idx" ON "ChecklistItem"("contratoId");

-- CreateIndex
CREATE INDEX "ChecklistItem_verificadoPorId_idx" ON "ChecklistItem"("verificadoPorId");

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "contratos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_verificadoPorId_fkey" FOREIGN KEY ("verificadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
