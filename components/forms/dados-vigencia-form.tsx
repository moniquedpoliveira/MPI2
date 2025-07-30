"use client"

import { useForm } from "react-hook-form"
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Contrato } from "@prisma/client"

interface DadosVigenciaFormProps {
  data: Partial<Contrato>
  onDataChange: (data: Partial<Contrato>) => void
}

const toISODateString = (date: Date | string | undefined | null) => {
  if (!date) return ""
  try {
    return new Date(date).toISOString().split("T")[0]
  } catch (e) {
    return ""
  }
}

export function DadosVigenciaForm({ data, onDataChange }: DadosVigenciaFormProps) {
  const { register, watch, setValue, getValues } = useForm({
    defaultValues: {
      dataAssinatura: toISODateString(data.dataAssinatura),
      vigenciaInicio: toISODateString(data.vigenciaInicio),
      vigenciaTermino: toISODateString(data.vigenciaTermino),
      dataBaseReajuste: toISODateString(data.dataBaseReajuste),
      indiceReajuste: data.indiceReajuste || "",
    },
  })

  useEffect(() => {
    const subscription = watch((value) => {
      onDataChange({
        ...value,
        dataAssinatura: value.dataAssinatura ? new Date(value.dataAssinatura) : new Date(),
        vigenciaInicio: value.vigenciaInicio ? new Date(value.vigenciaInicio) : new Date(),
        vigenciaTermino: value.vigenciaTermino ? new Date(value.vigenciaTermino) : new Date(),
        dataBaseReajuste: value.dataBaseReajuste ? new Date(value.dataBaseReajuste) : undefined,
      })
    })
    return () => subscription.unsubscribe()
  }, [watch, onDataChange])

  const handleSelectChange = (field: string, value: string) => {
    setValue(field as any, value)
    const currentValues = getValues()
    onDataChange({
      ...currentValues,
      dataAssinatura: currentValues.dataAssinatura ? new Date(currentValues.dataAssinatura) : new Date(),
      vigenciaInicio: currentValues.vigenciaInicio ? new Date(currentValues.vigenciaInicio) : new Date(),
      vigenciaTermino: currentValues.vigenciaTermino ? new Date(currentValues.vigenciaTermino) : new Date(),
      dataBaseReajuste: currentValues.dataBaseReajuste ? new Date(currentValues.dataBaseReajuste) : undefined,
      [field]: value,
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="dataAssinatura">Data de Assinatura *</Label>
        <Input id="dataAssinatura" type="date" {...register("dataAssinatura", { required: true })} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vigenciaInicio">Vigência - Início *</Label>
          <Input id="vigenciaInicio" type="date" {...register("vigenciaInicio", { required: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vigenciaTermino">Vigência - Término *</Label>
          <Input id="vigenciaTermino" type="date" {...register("vigenciaTermino", { required: true })} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dataBaseReajuste">Data-Base para Reajuste/Revisão</Label>
          <Input id="dataBaseReajuste" type="date" {...register("dataBaseReajuste")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="indiceReajuste">Índice de Reajuste</Label>
          <Select
            value={watch("indiceReajuste") || ""}
            onValueChange={(value: string) => handleSelectChange("indiceReajuste", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o índice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IPCA">IPCA</SelectItem>
              <SelectItem value="INPC">INPC</SelectItem>
              <SelectItem value="IGP-M">IGP-M</SelectItem>
              <SelectItem value="IGP-DI">IGP-DI</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
