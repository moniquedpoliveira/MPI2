-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "password" TEXT NOT NULL,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "whatsapp" TEXT,
    "whatsappVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "address" TEXT,
    "cnpj" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contratos" (
    "id" TEXT NOT NULL,
    "numeroContrato" TEXT NOT NULL,
    "processoAdministrativo" TEXT NOT NULL,
    "modalidadeLicitacao" TEXT NOT NULL,
    "objeto" TEXT NOT NULL,
    "orgaoContratante" TEXT NOT NULL,
    "nomeContratada" TEXT NOT NULL,
    "cnpjContratada" TEXT NOT NULL,
    "representanteLegal" TEXT NOT NULL,
    "enderecoContratada" TEXT NOT NULL,
    "telefoneContratada" TEXT NOT NULL,
    "emailContratada" TEXT NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "dataAssinatura" TIMESTAMP(3) NOT NULL,
    "vigenciaInicio" TIMESTAMP(3) NOT NULL,
    "vigenciaTermino" TIMESTAMP(3) NOT NULL,
    "dataBaseReajuste" TIMESTAMP(3),
    "indiceReajuste" TEXT,
    "tipoGarantia" TEXT,
    "valorGarantia" DOUBLE PRECISION,
    "vigenciaGarantia" TIMESTAMP(3),
    "gestorContrato" TEXT NOT NULL,
    "portariaGestor" TEXT,
    "emailGestor" TEXT,
    "telefoneGestor" TEXT,
    "fiscalAdministrativo" TEXT,
    "portariaFiscalAdm" TEXT,
    "emailFiscalAdm" TEXT,
    "telefoneFiscalAdm" TEXT,
    "fiscalTecnico" TEXT,
    "portariaFiscalTec" TEXT,
    "emailFiscalTec" TEXT,
    "telefoneFiscalTec" TEXT,
    "fiscalSubstituto" TEXT,
    "portariaFiscalSub" TEXT,
    "emailFiscalSub" TEXT,
    "sancaoAdministrativa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "contratos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "contratos_numeroContrato_idx" ON "contratos"("numeroContrato");

-- CreateIndex
CREATE INDEX "contratos_cnpjContratada_idx" ON "contratos"("cnpjContratada");

-- CreateIndex
CREATE INDEX "contratos_userId_idx" ON "contratos"("userId");

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
