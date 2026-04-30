'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { ImovelDetail, ImovelWritePayload } from '@/types/api'

const tipoOpts = [
  { value: 'APARTAMENTO', label: 'Apartamento' },
  { value: 'COBERTURA', label: 'Cobertura' },
  { value: 'CASA', label: 'Casa' },
  { value: 'SOBRADO', label: 'Sobrado' },
  { value: 'TERRENO', label: 'Terreno' },
  { value: 'COMERCIAL', label: 'Comercial' },
]
const statusOpts = [
  { value: 'DISPONIVEL', label: 'Disponível' },
  { value: 'RESERVADO', label: 'Reservado' },
  { value: 'EM_NEGOCIACAO', label: 'Em negociação' },
  { value: 'VENDIDO', label: 'Vendido' },
  { value: 'INATIVO', label: 'Inativo' },
]

const schema = z.object({
  titulo: z.string().min(3),
  slug: z.string().optional(),
  descricao: z.string().min(10),
  tipo: z.enum(['APARTAMENTO', 'COBERTURA', 'CASA', 'SOBRADO', 'TERRENO', 'COMERCIAL']),
  status: z.enum(['DISPONIVEL', 'RESERVADO', 'EM_NEGOCIACAO', 'VENDIDO', 'INATIVO']).optional(),
  preco: z.coerce.number().positive(),
  precoSinal: z.coerce.number().nonnegative().optional(),
  area: z.coerce.number().positive(),
  areaTotal: z.coerce.number().positive().optional(),
  quartos: z.coerce.number().int().nonnegative(),
  suites: z.coerce.number().int().nonnegative(),
  banheiros: z.coerce.number().int().nonnegative(),
  vagas: z.coerce.number().int().nonnegative(),
  endereco: z.string().min(3),
  bairro: z.string().min(2),
  cidade: z.string().min(2),
  estado: z.string().length(2),
  cep: z.string().min(5),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  fotosCsv: z.string().min(1, 'Pelo menos uma URL de foto'),
  destaque: z.boolean().optional(),
  novidade: z.boolean().optional(),
  iptuAnual: z.coerce.number().optional(),
  condominio: z.coerce.number().optional(),
  amenidadesCsv: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface ImovelFormProps {
  initial?: ImovelDetail
  onSubmit: (payload: ImovelWritePayload) => Promise<void>
  submitLabel: string
}

export function ImovelForm({ initial, onSubmit, submitLabel }: ImovelFormProps) {
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          titulo: initial.titulo,
          slug: initial.slug,
          descricao: initial.descricao,
          tipo: initial.tipo,
          status: initial.status,
          preco: Number(initial.preco),
          precoSinal: Number(initial.precoSinal),
          area: initial.area,
          areaTotal: initial.areaTotal ?? undefined,
          quartos: initial.quartos,
          suites: initial.suites,
          banheiros: initial.banheiros,
          vagas: initial.vagas,
          endereco: initial.endereco,
          bairro: initial.bairro,
          cidade: initial.cidade,
          estado: initial.estado,
          cep: initial.cep,
          latitude: initial.latitude,
          longitude: initial.longitude,
          fotosCsv: (initial.fotos || []).join('\n'),
          destaque: initial.destaque,
          novidade: initial.novidade,
          iptuAnual: initial.iptuAnual ? Number(initial.iptuAnual) : undefined,
          condominio: initial.condominio ? Number(initial.condominio) : undefined,
          amenidadesCsv: (initial.amenidades || []).join(', '),
        }
      : { tipo: 'APARTAMENTO', status: 'DISPONIVEL', estado: 'SP' } as Partial<FormData>,
  })

  const submit = async (data: FormData) => {
    setError(null)
    try {
      const payload: ImovelWritePayload = {
        titulo: data.titulo,
        slug: data.slug || undefined,
        descricao: data.descricao,
        tipo: data.tipo,
        status: data.status,
        preco: data.preco,
        precoSinal: data.precoSinal,
        area: data.area,
        areaTotal: data.areaTotal,
        quartos: data.quartos,
        suites: data.suites,
        banheiros: data.banheiros,
        vagas: data.vagas,
        endereco: data.endereco,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado.toUpperCase(),
        cep: data.cep,
        latitude: data.latitude,
        longitude: data.longitude,
        fotos: data.fotosCsv
          .split(/\n|,/)
          .map((s) => s.trim())
          .filter(Boolean),
        destaque: !!data.destaque,
        novidade: !!data.novidade,
        iptuAnual: data.iptuAnual,
        condominio: data.condominio,
        amenidades: (data.amenidadesCsv || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      }
      await onSubmit(payload)
    } catch (err) {
      setError((err as Error).message || 'Falha ao salvar')
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-8">
      <Section title="Informações principais">
        <Input label="Título" {...register('titulo')} error={errors.titulo?.message} />
        <Input
          label="Slug (opcional, gerado se vazio)"
          {...register('slug')}
          error={errors.slug?.message}
        />
        <Textarea
          label="Descrição"
          rows={6}
          {...register('descricao')}
          error={errors.descricao?.message}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Select label="Tipo" options={tipoOpts} {...register('tipo')} error={errors.tipo?.message} />
          <Select
            label="Status"
            options={statusOpts}
            {...register('status')}
            error={errors.status?.message}
          />
        </div>
      </Section>

      <Section title="Preço">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Preço (R$)"
            type="number"
            step="0.01"
            {...register('preco')}
            error={errors.preco?.message}
          />
          <Input
            label="Sinal sugerido (R$, opcional)"
            type="number"
            step="0.01"
            {...register('precoSinal')}
            error={errors.precoSinal?.message}
            hint="Se vazio, usa 5% do preço."
          />
        </div>
      </Section>

      <Section title="Características">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <Input label="Quartos" type="number" {...register('quartos')} error={errors.quartos?.message} />
          <Input label="Suítes" type="number" {...register('suites')} error={errors.suites?.message} />
          <Input label="Banheiros" type="number" {...register('banheiros')} error={errors.banheiros?.message} />
          <Input label="Vagas" type="number" {...register('vagas')} error={errors.vagas?.message} />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <Input label="Área útil (m²)" type="number" step="0.01" {...register('area')} error={errors.area?.message} />
          <Input
            label="Área total (m², opcional)"
            type="number"
            step="0.01"
            {...register('areaTotal')}
          />
        </div>
        <Input
          label="Amenidades (separadas por vírgula)"
          {...register('amenidadesCsv')}
          hint="Ex: piscina, academia, sauna"
        />
      </Section>

      <Section title="Endereço">
        <Input label="Endereço" {...register('endereco')} error={errors.endereco?.message} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Input label="Bairro" {...register('bairro')} error={errors.bairro?.message} />
          <Input label="Cidade" {...register('cidade')} error={errors.cidade?.message} />
          <Input label="UF" maxLength={2} {...register('estado')} error={errors.estado?.message} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Input label="CEP" {...register('cep')} error={errors.cep?.message} />
          <Input label="Latitude" type="number" step="any" {...register('latitude')} error={errors.latitude?.message} />
          <Input label="Longitude" type="number" step="any" {...register('longitude')} error={errors.longitude?.message} />
        </div>
      </Section>

      <Section title="Mídia">
        <Textarea
          label="Fotos (uma URL por linha)"
          rows={5}
          {...register('fotosCsv')}
          error={errors.fotosCsv?.message}
        />
      </Section>

      <Section title="Custos recorrentes (opcional)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="IPTU anual (R$)" type="number" step="0.01" {...register('iptuAnual')} />
          <Input label="Condomínio (R$/mês)" type="number" step="0.01" {...register('condominio')} />
        </div>
      </Section>

      <Section title="Flags">
        <label className="flex items-center gap-3 text-body-sm">
          <input type="checkbox" {...register('destaque')} className="accent-moss" />
          <span>Destaque na home</span>
        </label>
        <label className="flex items-center gap-3 text-body-sm">
          <input type="checkbox" {...register('novidade')} className="accent-moss" />
          <span>Marcar como novidade</span>
        </label>
      </Section>

      {error && (
        <p className="text-caption text-red-600 bg-red-50 border border-red-100 px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-2">
        {title}
      </legend>
      {children}
    </fieldset>
  )
}
