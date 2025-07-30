"use client"

import { useForm } from "react-hook-form"
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Contrato } from "@prisma/client"

interface DadosBasicosFormProps {
  data: Partial<Contrato>
  onDataChange: (data: Partial<Contrato>) => void
}

export function DadosBasicosForm({ data, onDataChange }: DadosBasicosFormProps) {
  const { register, watch, setValue, getValues } = useForm({
    defaultValues: {
      numeroContrato: data.numeroContrato || "",
      processoAdministrativo: data.processoAdministrativo || "",
      modalidadeLicitacao: data.modalidadeLicitacao || "",
      objeto: data.objeto || "",
      orgaoContratante: data.orgaoContratante || "",
    },
  })

  // Watch for changes and update parent
  useEffect(() => {
    const subscription = watch((value) => {
      onDataChange(value as Partial<Contrato>)
    })
    return () => subscription.unsubscribe()
  }, [watch, onDataChange])

  const handleSelectChange = (field: string, value: string) => {
    setValue(field as any, value)
    const currentValues = getValues()
    onDataChange({ ...currentValues, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numeroContrato">Número do Contrato *</Label>
          <Input id="numeroContrato" placeholder="Ex: 001/2024" {...register("numeroContrato", { required: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="processoAdministrativo">Processo Administrativo *</Label>
          <Input
            id="processoAdministrativo"
            placeholder="Ex: PA-2024-001"
            {...register("processoAdministrativo", { required: true })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="modalidadeLicitacao">Modalidade da Licitação *</Label>
        <Select
          value={data.modalidadeLicitacao || ""}
          onValueChange={(value: string) => handleSelectChange("modalidadeLicitacao", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a modalidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pregão Eletrônico">Pregão Eletrônico</SelectItem>
            <SelectItem value="Pregão Presencial">Pregão Presencial</SelectItem>
            <SelectItem value="Concorrência">Concorrência</SelectItem>
            <SelectItem value="Tomada de Preços">Tomada de Preços</SelectItem>
            <SelectItem value="Convite">Convite</SelectItem>
            <SelectItem value="Dispensa">Dispensa</SelectItem>
            <SelectItem value="Inexigibilidade">Inexigibilidade</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="objeto">Objeto do Contrato *</Label>
        <Textarea
          id="objeto"
          placeholder="Descreva o objeto do contrato..."
          rows={3}
          {...register("objeto", { required: true })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="orgaoContratante">Órgão/Entidade Contratante *</Label>
        <Input
          id="orgaoContratante"
          placeholder="Ex: Secretaria Municipal de Administração"
          {...register("orgaoContratante", { required: true })}
        />
      </div>
    </div>
  )
}
