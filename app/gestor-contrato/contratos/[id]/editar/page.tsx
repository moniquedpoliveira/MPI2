"use client";

import { useState, useCallback, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { DadosBasicosForm } from "@/components/forms/dados-basicos-form";
import { DadosContratadaForm } from "@/components/forms/dados-contratada-form";
import { DadosFinanceirosForm } from "@/components/forms/dados-financeiros-form";
import { DadosVigenciaForm } from "@/components/forms/dados-vigencia-form";
import { DadosResponsaveisForm } from "@/components/forms/dados-responsaveis-form";
import { getContratoById, updateContrato } from "@/actions/contratos";
import type { Contrato } from "@prisma/client";
import { toast } from "sonner";

const steps = [
  {
    id: 1,
    title: "Dados Básicos",
    description: "Informações gerais do contrato",
  },
  { id: 2, title: "Contratada", description: "Dados da empresa contratada" },
  { id: 3, title: "Financeiro", description: "Valores e garantias" },
  { id: 4, title: "Vigência", description: "Prazos e reajustes" },
  { id: 5, title: "Responsáveis", description: "Gestores e fiscais" },
];

export default function EditarContratoPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Contrato>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchContrato = async () => {
      const contrato = await getContratoById(id);
      if (contrato) {
        setFormData(contrato);
      }
    };
    fetchContrato();
  }, [id]);

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepData = useCallback((stepData: Partial<Contrato>) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updateContrato(id, formData);
      toast.success("Contrato atualizado com sucesso.");
      router.push(`/contratos/${id}`);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar contrato. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (Object.keys(formData).length === 0) {
      return <div>Carregando...</div>;
    }
    switch (currentStep) {
      case 1:
        return (
          <DadosBasicosForm data={formData} onDataChange={handleStepData} />
        );
      case 2:
        return (
          <DadosContratadaForm data={formData} onDataChange={handleStepData} />
        );
      case 3:
        return (
          <DadosFinanceirosForm data={formData} onDataChange={handleStepData} />
        );
      case 4:
        return (
          <DadosVigenciaForm data={formData} onDataChange={handleStepData} />
        );
      case 5:
        return (
          <DadosResponsaveisForm
            data={formData}
            onDataChange={handleStepData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div>
          <h1 className="font-semibold text-lg">Editar Contrato</h1>
          <p className="text-sm text-muted-foreground">
            Altere as informações do contrato
          </p>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Progress */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>
                    Etapa {currentStep} de {steps.length}
                  </span>
                  <span>{Math.round(progress)}% concluído</span>
                </div>
                <Progress value={progress} className="w-full" />
                <div className="flex justify-between">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className={`text-center ${
                        currentStep === step.id
                          ? "text-primary font-medium"
                          : currentStep > step.id
                            ? "text-green-600"
                            : "text-muted-foreground"
                      }`}
                    >
                      <div className="text-xs">{step.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
              <CardDescription>
                {steps[currentStep - 1].description}
              </CardDescription>
            </CardHeader>
            <CardContent>{renderStepContent()}</CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            {currentStep === steps.length ? (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
