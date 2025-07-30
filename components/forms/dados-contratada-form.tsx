"use client"

import { useForm } from "react-hook-form"
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Contrato } from "@prisma/client"

interface DadosContratadaFormProps {
  data: Partial<Contrato>
  onDataChange: (data: Partial<Contrato>) => void
}

export function DadosContratadaForm({ data, onDataChange }: DadosContratadaFormProps) {
  const { register, watch } = useForm({
    defaultValues: {
      nomeContratada: data.nomeContratada || "",
      cnpjContratada: data.cnpjContratada || "",
      representanteLegal: data.representanteLegal || "",
      enderecoContratada: data.enderecoContratada || "",
      telefoneContratada: data.telefoneContratada || "",
      emailContratada: data.emailContratada || "",
    },
  })

  // Watch for changes and update parent
  useEffect(() => {
    const subscription = watch((value) => {
      onDataChange(value as Partial<Contrato>)
    })
    return () => subscription.unsubscribe()
  }, [watch, onDataChange])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nomeContratada">Nome da Contratada *</Label>
          <Input
            id="nomeContratada"
            placeholder="Ex: Empresa Exemplo Ltda"
            {...register("nomeContratada", { required: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnpjContratada">CNPJ da Contratada *</Label>
          <Input
            id="cnpjContratada"
            placeholder="00.000.000/0000-00"
            {...register("cnpjContratada", { required: true })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="representanteLegal">Representante Legal *</Label>
        <Input
          id="representanteLegal"
          placeholder="Nome completo do representante legal"
          {...register("representanteLegal", { required: true })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="enderecoContratada">Endereço da Contratada *</Label>
        <Textarea
          id="enderecoContratada"
          placeholder="Endereço completo da empresa"
          rows={2}
          {...register("enderecoContratada", { required: true })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="telefoneContratada">Telefone da Contratada *</Label>
          <Input
            id="telefoneContratada"
            placeholder="(11) 99999-9999"
            {...register("telefoneContratada", { required: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emailContratada">E-mail da Contratada *</Label>
          <Input
            id="emailContratada"
            type="email"
            placeholder="contato@empresa.com.br"
            {...register("emailContratada", { required: true })}
          />
        </div>
      </div>
    </div>
  )
}
