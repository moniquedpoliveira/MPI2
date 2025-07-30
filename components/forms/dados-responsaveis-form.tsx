"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllFiscais } from "@/actions/fiscais";
import type { Contrato } from "@prisma/client";

interface Fiscal {
  id: string;
  name: string | null;
  email: string;
  role: string;
  whatsapp: string | null;
}

interface DadosResponsaveisFormProps {
  data: Partial<Contrato>;
  onDataChange: (data: Partial<Contrato>) => void;
}

export function DadosResponsaveisForm({
  data,
  onDataChange,
}: DadosResponsaveisFormProps) {
  const [fiscais, setFiscais] = useState<Fiscal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = useRef(false);

  const { register, watch, setValue, getValues } = useForm({
    defaultValues: {
      gestorContrato: data.gestorContrato || "",
      portariaGestor: data.portariaGestor || "",
      emailGestor: data.emailGestor || "",
      telefoneGestor: data.telefoneGestor || "",

      // New ID-based fields
      fiscalAdministrativoId: data.fiscalAdministrativoId || "",
      fiscalTecnicoId: data.fiscalTecnicoId || "",
      fiscalSubstitutoId: data.fiscalSubstitutoId || "",

      // Legacy display fields
      fiscalAdministrativoLegacy: data.fiscalAdministrativoLegacy || "",
      fiscalTecnicoLegacy: data.fiscalTecnicoLegacy || "",
      fiscalSubstitutoLegacy: data.fiscalSubstitutoLegacy || "",

      portariaFiscalAdm: data.portariaFiscalAdm || "",
      emailFiscalAdm: data.emailFiscalAdm || "",
      telefoneFiscalAdm: data.telefoneFiscalAdm || "",
      portariaFiscalTec: data.portariaFiscalTec || "",
      emailFiscalTec: data.emailFiscalTec || "",
      telefoneFiscalTec: data.telefoneFiscalTec || "",
      portariaFiscalSub: data.portariaFiscalSub || "",
      emailFiscalSub: data.emailFiscalSub || "",
      sancaoAdministrativa: data.sancaoAdministrativa || "",
    },
  });

  const debouncedOnDataChange = useCallback(
    debounce((values) => {
      onDataChange(values);
    }, 500),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    const subscription = watch((value) => {
      debouncedOnDataChange(value as Partial<Contrato>);
    });
    return () => subscription.unsubscribe();
  }, [watch, debouncedOnDataChange]);

  // Fetch fiscais only once on component mount
  useEffect(() => {
    const fetchFiscais = async () => {
      try {
        const fiscaisData = await getAllFiscais();
        setFiscais(fiscaisData);
      } catch (error) {
        console.error("Erro ao buscar fiscais:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFiscais();
  }, []);

  // Initialize form values when fiscais are loaded and data is available
  useEffect(() => {
    if (fiscais.length > 0 && !isLoading && !isInitialized.current) {
      const defaultFormValues = getValues();
      for (const key in defaultFormValues) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const value = data[key as keyof typeof data];
          if (value !== null && value !== undefined) {
            setValue(key as keyof typeof defaultFormValues, String(value));
          }
        }
      }

      // Set fiscal IDs based on existing relationships or emails
      if (data.fiscalAdministrativoId) {
        setValue("fiscalAdministrativoId", data.fiscalAdministrativoId);
      } else if (data.emailFiscalAdm) {
        const fiscal = fiscais.find(
          (f) =>
            f.email === data.emailFiscalAdm &&
            f.role === "FISCAL_ADMINISTRATIVO"
        );
        if (fiscal) {
          setValue("fiscalAdministrativoId", fiscal.id);
        }
      }

      if (data.fiscalTecnicoId) {
        setValue("fiscalTecnicoId", data.fiscalTecnicoId);
      } else if (data.emailFiscalTec) {
        const fiscal = fiscais.find(
          (f) => f.email === data.emailFiscalTec && f.role === "FISCAL_TECNICO"
        );
        if (fiscal) {
          setValue("fiscalTecnicoId", fiscal.id);
        }
      }

      if (data.fiscalSubstitutoId) {
        setValue("fiscalSubstitutoId", data.fiscalSubstitutoId);
      } else if (data.emailFiscalSub) {
        const fiscal = fiscais.find((f) => f.email === data.emailFiscalSub);
        if (fiscal) {
          setValue("fiscalSubstitutoId", fiscal.id);
        }
      }

      isInitialized.current = true;
    }
  }, [fiscais, data, isLoading, setValue, getValues]);

  const handleFiscalChange = useCallback(
    (fiscalType: string, fiscalId: string) => {
      if (fiscalId === "none") {
        // Clear the selection
        if (fiscalType === "fiscalAdministrativoId") {
          setValue("fiscalAdministrativoId", "");
          setValue("fiscalAdministrativoLegacy", "");
          setValue("emailFiscalAdm", "");
          setValue("telefoneFiscalAdm", "");
        } else if (fiscalType === "fiscalTecnicoId") {
          setValue("fiscalTecnicoId", "");
          setValue("fiscalTecnicoLegacy", "");
          setValue("emailFiscalTec", "");
          setValue("telefoneFiscalTec", "");
        } else if (fiscalType === "fiscalSubstitutoId") {
          setValue("fiscalSubstitutoId", "");
          setValue("fiscalSubstitutoLegacy", "");
          setValue("emailFiscalSub", "");
        }
        return;
      }

      const selectedFiscal = fiscais.find((f) => f.id === fiscalId);
      if (selectedFiscal) {
        if (fiscalType === "fiscalAdministrativoId") {
          setValue("fiscalAdministrativoId", selectedFiscal.id);
          setValue(
            "fiscalAdministrativoLegacy",
            `${selectedFiscal.name} - ${selectedFiscal.email}`
          );
          setValue("emailFiscalAdm", selectedFiscal.email);
          setValue("telefoneFiscalAdm", selectedFiscal.whatsapp || "");
        } else if (fiscalType === "fiscalTecnicoId") {
          setValue("fiscalTecnicoId", selectedFiscal.id);
          setValue(
            "fiscalTecnicoLegacy",
            `${selectedFiscal.name} - ${selectedFiscal.email}`
          );
          setValue("emailFiscalTec", selectedFiscal.email);
          setValue("telefoneFiscalTec", selectedFiscal.whatsapp || "");
        } else if (fiscalType === "fiscalSubstitutoId") {
          setValue("fiscalSubstitutoId", selectedFiscal.id);
          setValue(
            "fiscalSubstitutoLegacy",
            `${selectedFiscal.name} - ${selectedFiscal.email}`
          );
          setValue("emailFiscalSub", selectedFiscal.email);
        }
      }
      // Manually trigger the data change on fiscal selection
      onDataChange(getValues() as Partial<Contrato>);
    },
    [fiscais, setValue, onDataChange, getValues]
  );

  const fiscaisAdministrativos = fiscais.filter(
    (f) => f.role === "FISCAL_ADMINISTRATIVO"
  );
  const fiscaisTecnicos = fiscais.filter((f) => f.role === "FISCAL_TECNICO");

  if (isLoading) {
    return <div>Carregando fiscais...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Gestor do Contrato */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Gestor do Contrato</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gestorContrato">Nome/Matrícula *</Label>
            <Input
              id="gestorContrato"
              placeholder="Ex: Maria Silva - Mat. 12345"
              {...register("gestorContrato", { required: true })}
              defaultValue={data.gestorContrato || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portariaGestor">Portaria de Designação</Label>
            <Input
              id="portariaGestor"
              placeholder="Ex: Portaria nº 001/2024"
              {...register("portariaGestor")}
              defaultValue={data.portariaGestor || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailGestor">E-mail</Label>
            <Input
              id="emailGestor"
              type="email"
              placeholder="gestor@prefeitura.gov.br"
              {...register("emailGestor")}
              defaultValue={data.emailGestor || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefoneGestor">Telefone Celular</Label>
            <Input
              id="telefoneGestor"
              placeholder="(11) 99999-9999"
              {...register("telefoneGestor")}
              defaultValue={data.telefoneGestor || ""}
            />
          </div>
        </div>
      </div>

      {/* Fiscal Administrativo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Fiscal Administrativo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fiscalAdministrativo">Selecionar Fiscal</Label>
            <Select
              onValueChange={(value) =>
                handleFiscalChange("fiscalAdministrativoId", value)
              }
              defaultValue={data.fiscalAdministrativoId || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um fiscal administrativo" />
              </SelectTrigger>
              <SelectContent>
                {fiscaisAdministrativos.map((fiscal) => (
                  <SelectItem key={fiscal.id} value={fiscal.id}>
                    {fiscal.name} - {fiscal.email}
                  </SelectItem>
                ))}
                <SelectItem value="none">Nenhum</SelectItem>
              </SelectContent>
            </Select>
            <Input
              id="fiscalAdministrativo"
              placeholder="Fiscal selecionado aparecerá aqui"
              {...register("fiscalAdministrativoLegacy")}
              readOnly
              defaultValue={data.fiscalAdministrativoLegacy || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portariaFiscalAdm">Portaria de Designação</Label>
            <Input
              id="portariaFiscalAdm"
              placeholder="Ex: Portaria nº 002/2024"
              {...register("portariaFiscalAdm")}
              defaultValue={data.portariaFiscalAdm || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailFiscalAdm">E-mail</Label>
            <Input
              id="emailFiscalAdm"
              type="email"
              placeholder="fiscal.adm@prefeitura.gov.br"
              {...register("emailFiscalAdm")}
              readOnly
              defaultValue={data.emailFiscalAdm || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefoneFiscalAdm">Telefone Celular</Label>
            <Input
              id="telefoneFiscalAdm"
              placeholder="(11) 99999-9999"
              {...register("telefoneFiscalAdm")}
              readOnly
              defaultValue={data.telefoneFiscalAdm || ""}
            />
          </div>
        </div>
      </div>

      {/* Fiscal Técnico */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Fiscal Técnico</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fiscalTecnico">Selecionar Fiscal</Label>
            <Select
              onValueChange={(value) =>
                handleFiscalChange("fiscalTecnicoId", value)
              }
              defaultValue={data.fiscalTecnicoId || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um fiscal técnico" />
              </SelectTrigger>
              <SelectContent>
                {fiscaisTecnicos.map((fiscal) => (
                  <SelectItem key={fiscal.id} value={fiscal.id}>
                    {fiscal.name} - {fiscal.email}
                  </SelectItem>
                ))}
                <SelectItem value="none">Nenhum</SelectItem>
              </SelectContent>
            </Select>
            <Input
              id="fiscalTecnico"
              placeholder="Fiscal selecionado aparecerá aqui"
              {...register("fiscalTecnicoLegacy")}
              readOnly
              defaultValue={data.fiscalTecnicoLegacy || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portariaFiscalTec">Portaria de Designação</Label>
            <Input
              id="portariaFiscalTec"
              placeholder="Ex: Portaria nº 003/2024"
              {...register("portariaFiscalTec")}
              defaultValue={data.portariaFiscalTec || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailFiscalTec">E-mail</Label>
            <Input
              id="emailFiscalTec"
              type="email"
              placeholder="fiscal.tec@prefeitura.gov.br"
              {...register("emailFiscalTec")}
              readOnly
              defaultValue={data.emailFiscalTec || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefoneFiscalTec">Telefone Celular</Label>
            <Input
              id="telefoneFiscalTec"
              placeholder="(11) 99999-9999"
              {...register("telefoneFiscalTec")}
              readOnly
              defaultValue={data.telefoneFiscalTec || ""}
            />
          </div>
        </div>
      </div>

      {/* Fiscal Substituto */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Fiscal Substituto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fiscalSubstituto">Selecionar Fiscal</Label>
            <Select
              onValueChange={(value) =>
                handleFiscalChange("fiscalSubstitutoId", value)
              }
              defaultValue={data.fiscalSubstitutoId || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um fiscal substituto" />
              </SelectTrigger>
              <SelectContent>
                {fiscais.map((fiscal) => (
                  <SelectItem key={fiscal.id} value={fiscal.id}>
                    {fiscal.name} - {fiscal.email}
                  </SelectItem>
                ))}
                <SelectItem value="none">Nenhum</SelectItem>
              </SelectContent>
            </Select>
            <Input
              id="fiscalSubstituto"
              placeholder="Fiscal selecionado aparecerá aqui"
              {...register("fiscalSubstitutoLegacy")}
              readOnly
              defaultValue={data.fiscalSubstitutoLegacy || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portariaFiscalSub">Portaria de Designação</Label>
            <Input
              id="portariaFiscalSub"
              placeholder="Ex: Portaria nº 004/2024"
              {...register("portariaFiscalSub")}
              defaultValue={data.portariaFiscalSub || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailFiscalSub">E-mail</Label>
            <Input
              id="emailFiscalSub"
              type="email"
              placeholder="fiscal.sub@prefeitura.gov.br"
              {...register("emailFiscalSub")}
              readOnly
              defaultValue={data.emailFiscalSub || ""}
            />
          </div>
        </div>
      </div>

      {/* Sanção Administrativa */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Sanção Administrativa</h3>
        <div className="space-y-2">
          <Label htmlFor="sancaoAdministrativa">Sanção Administrativa</Label>
          <Textarea
            id="sancaoAdministrativa"
            placeholder="Descreva eventuais sanções administrativas ou digite 'Nenhuma'"
            rows={3}
            {...register("sancaoAdministrativa")}
            defaultValue={data.sancaoAdministrativa || ""}
          />
        </div>
      </div>
    </div>
  );
}

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => func(...args), waitFor);
  };
}
