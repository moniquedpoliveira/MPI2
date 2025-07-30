/*
  Warnings:

  - You are about to drop the column `fiscalAdministrativo` on the `contratos` table. All the data in the column will be lost.
  - You are about to drop the column `fiscalSubstituto` on the `contratos` table. All the data in the column will be lost.
  - You are about to drop the column `fiscalTecnico` on the `contratos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "contratos" DROP COLUMN "fiscalAdministrativo",
DROP COLUMN "fiscalSubstituto",
DROP COLUMN "fiscalTecnico",
ADD COLUMN     "fiscalAdministrativoId" TEXT,
ADD COLUMN     "fiscalAdministrativoLegacy" TEXT,
ADD COLUMN     "fiscalSubstitutoId" TEXT,
ADD COLUMN     "fiscalSubstitutoLegacy" TEXT,
ADD COLUMN     "fiscalTecnicoId" TEXT,
ADD COLUMN     "fiscalTecnicoLegacy" TEXT;

-- CreateIndex
CREATE INDEX "contratos_fiscalAdministrativoId_idx" ON "contratos"("fiscalAdministrativoId");

-- CreateIndex
CREATE INDEX "contratos_fiscalTecnicoId_idx" ON "contratos"("fiscalTecnicoId");

-- CreateIndex
CREATE INDEX "contratos_fiscalSubstitutoId_idx" ON "contratos"("fiscalSubstitutoId");

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_fiscalAdministrativoId_fkey" FOREIGN KEY ("fiscalAdministrativoId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_fiscalTecnicoId_fkey" FOREIGN KEY ("fiscalTecnicoId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_fiscalSubstitutoId_fkey" FOREIGN KEY ("fiscalSubstitutoId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
