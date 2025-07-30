/*
  Warnings:

  - You are about to drop the column `mustChangePassword` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[numeroContrato]` on the table `contratos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[processoAdministrativo]` on the table `contratos` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "mustChangePassword";

-- CreateIndex
CREATE UNIQUE INDEX "contratos_numeroContrato_key" ON "contratos"("numeroContrato");

-- CreateIndex
CREATE UNIQUE INDEX "contratos_processoAdministrativo_key" ON "contratos"("processoAdministrativo");
