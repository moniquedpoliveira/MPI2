"use client"

import { useForm } from "react-hook-form"
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Contrato } from "@prisma/client"

interface DadosFinanceirosFormProps {
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

export function DadosFinanceirosForm({ data, onDataChange }: DadosFinanceirosFormProps) {
  const { register, watch, setValue, getValues } = useForm({
    defaultValues: {
      valorTotal: data.valorTotal || 0,
      tipoGarantia: data.tipoGarantia || "",
      valorGarantia: data.valorGarantia || 0,
      vigenciaGarantia: toISODateString(data.vigenciaGarantia),
    },
  })

  useEffect(() => {
    const subscription = watch((value) => {
      onDataChange({
        ...value,
        valorTotal: Number(value.valorTotal) || 0,
        valorGarantia: Number(value.valorGarantia) || 0,
        vigenciaGarantia: value.vigenciaGarantia ? new Date(value.vigenciaGarantia) : undefined,
      })
    })
    return () => subscription.unsubscribe()
  }, [watch, onDataChange])

  const handleSelectChange = (field: string, value: string) => {
    setValue(field as any, value)
    const currentValues = getValues()
    onDataChange({
      ...currentValues,
      valorTotal: Number(currentValues.valorTotal) || 0,
      valorGarantia: Number(currentValues.valorGarantia) || 0,
      vigenciaGarantia: currentValues.vigenciaGarantia ? new Date(currentValues.vigenciaGarantia) : undefined,
      [field]: value,
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="valorTotal">Valor Total do Contrato (R$) *</Label>
        <Input
          id="valorTotal"
          type="number"
          step="0.01"
          placeholder="0,00"
          {...register("valorTotal", { required: true, valueAsNumber: true })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tipoGarantia">Tipo de Garantia</Label>
          <Select
            value={watch("tipoGarantia") || ""}
            onValueChange={(value: string) => handleSelectChange("tipoGarantia", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Caução">Caução</SelectItem>
              <SelectItem value="Seguro-garantia">Seguro-garantia</SelectItem>
              <SelectItem value="Fiança">Fiança</SelectItem>
              <SelectItem value="Nenhuma">Nenhuma</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="valorGarantia">Valor da Garantia (R$)</Label>
          <Input
            id="valorGarantia"
            type="number"
            step="0.01"
            placeholder="0,00"
            {...register("valorGarantia", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vigenciaGarantia">Vigência da Garantia</Label>
        <Input id="vigenciaGarantia" type="date" {...register("vigenciaGarantia")} />
      </div>
    </div>
  )
}
