// =============================================================================
// Kore Tech — Painel admin > Personas
//
// CRUD de personas (Valorant 240fps, Fortnite competitivo, IA Local Llama, ...)
// Cada persona = landing SEO indexável + filtro de PCs montados.
// =============================================================================

'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Trash2, Edit3, Layers, Image as ImageIcon, Plus as PlusIcon,
} from 'lucide-react'
import { adminPersonas, adminUpload } from '@/services/admin'
import type { Persona, PersonaInput } from '@/services/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { EmptyState, Skeleton } from '@/components/Skeleton'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'

type EditingState =
  | { mode: 'create' }
  | { mode: 'edit'; persona: Persona }
  | null

export default function PersonasPage() {
  const qc    = useQueryClient()
  const toast = useToast()

  const personasQ = useQuery({
    queryKey: ['admin', 'personas'],
    queryFn:  () => adminPersonas.list(),
  })

  const [editing, setEditing] = useState<EditingState>(null)
  const [confirmDelete, setConfirmDelete] = useState<Persona | null>(null)

  const createOrUpdate = useMutation({
    mutationFn: async ({ slug, body }: { slug?: string; body: PersonaInput }) =>
      slug ? adminPersonas.update(slug, body) : adminPersonas.create(body),
    onSuccess: () => {
      toast.push({ tone: 'success', title: editing?.mode === 'edit' ? 'Persona atualizada' : 'Persona criada' })
      qc.invalidateQueries({ queryKey: ['admin', 'personas'] })
      setEditing(null)
    },
    onError: (err: unknown) => {
      toast.push({ tone: 'error', title: 'Não foi possível salvar', body: err instanceof Error ? err.message : '' })
    },
  })

  const remove = useMutation({
    mutationFn: (slug: string) => adminPersonas.remove(slug),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Persona removida' })
      qc.invalidateQueries({ queryKey: ['admin', 'personas'] })
      setConfirmDelete(null)
    },
    onError: (err: unknown) => {
      toast.push({ tone: 'error', title: 'Não foi possível remover', body: err instanceof Error ? err.message : '' })
    },
  })

  const personas = personasQ.data ?? []

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">Personas</h1>
          <p className="text-sm text-text-secondary">
            Cada persona vira landing SEO (/builds/[slug]) e organiza os PCs montados pelo uso (Valorant 240fps, IA Local Llama, ...).
          </p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setEditing({ mode: 'create' })}>
          Nova persona
        </Button>
      </header>

      {personasQ.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : personas.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-5 w-5" />}
          title="Nenhuma persona cadastrada"
          description="Crie personas pra organizar PCs montados por uso e gerar landings SEO indexáveis."
          action={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setEditing({ mode: 'create' })}>Nova persona</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {personas.map(p => (
            <article key={p.id} className="rounded-lg border border-border bg-surface p-5 shadow-md transition hover:border-primary/40">
              <div className="flex items-start gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-surface-2 ring-1 ring-border">
                  {p.heroImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={p.heroImage} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="absolute inset-0 m-auto h-5 w-5 text-text-muted" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold text-text">{p.name}</h2>
                  <p className="truncate text-xs font-mono text-text-secondary">{p.slug}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditing({ mode: 'edit', persona: p })}
                    className="rounded p-1.5 text-text-secondary hover:bg-surface-2 hover:text-primary"
                    aria-label="Editar"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(p)}
                    className="rounded p-1.5 text-text-secondary hover:bg-danger-soft hover:text-danger"
                    aria-label="Remover"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="mt-3 line-clamp-2 text-xs text-text-secondary">{p.description}</p>

              {p.targetGames.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.targetGames.slice(0, 4).map(g => (
                    <span key={g} className="rounded-pill border border-border bg-surface-2 px-2 py-0.5 text-[10px] text-text-secondary">
                      {g}
                    </span>
                  ))}
                  {p.targetGames.length > 4 && (
                    <span className="text-[10px] text-text-muted">+{p.targetGames.length - 4}</span>
                  )}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between text-[11px] text-text-muted">
                <span>FPS-alvo: <span className="font-mono text-text">{Object.keys(p.targetFps).length}</span> jogos</span>
                {typeof p.productCount === 'number' && (
                  <span>{p.productCount} PCs montados</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <PersonaEditor
          initial={editing.mode === 'edit' ? editing.persona : undefined}
          submitting={createOrUpdate.isPending}
          onSubmit={body =>
            createOrUpdate.mutate({
              slug: editing.mode === 'edit' ? editing.persona.slug : undefined,
              body,
            })
          }
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title={confirmDelete ? `Remover persona ${confirmDelete.name}?` : ''}
        description="A landing /builds/[slug] some. PCs associados perdem a referência mas continuam no catálogo."
        destructive
        confirmLabel="Remover"
        loading={remove.isPending}
        onConfirm={() => confirmDelete && remove.mutate(confirmDelete.slug)}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  )
}

// -----------------------------------------------------------------------------
// Editor (modal)
// -----------------------------------------------------------------------------
function PersonaEditor({
  initial, submitting, onSubmit, onClose,
}: {
  initial?:    Persona
  submitting:  boolean
  onSubmit:    (body: PersonaInput) => void
  onClose:     () => void
}) {
  const toast = useToast()
  const [form, setForm] = useState<PersonaInput>({
    slug:        initial?.slug        ?? '',
    name:        initial?.name        ?? '',
    description: initial?.description ?? '',
    targetGames: initial?.targetGames ?? [],
    targetFps:   initial?.targetFps   ?? {},
    heroImage:   initial?.heroImage   ?? null,
  })
  const [gameInput, setGameInput] = useState('')
  const [fpsKey,    setFpsKey]    = useState('')
  const [fpsVal,    setFpsVal]    = useState('')
  const [uploading, setUploading] = useState(false)

  function addGame() {
    const g = gameInput.trim()
    if (!g || form.targetGames.includes(g)) return
    setForm(prev => ({ ...prev, targetGames: [...prev.targetGames, g] }))
    setGameInput('')
  }
  function removeGame(g: string) {
    setForm(prev => ({ ...prev, targetGames: prev.targetGames.filter(x => x !== g) }))
  }
  function addFps() {
    const k = fpsKey.trim()
    const n = Number(fpsVal)
    if (!k || !Number.isFinite(n) || n <= 0) return
    setForm(prev => ({ ...prev, targetFps: { ...prev.targetFps, [k]: n } }))
    setFpsKey(''); setFpsVal('')
  }
  function removeFps(k: string) {
    setForm(prev => {
      const next = { ...prev.targetFps }
      delete next[k]
      return { ...prev, targetFps: next }
    })
  }

  async function uploadHero(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.push({ tone: 'error', title: 'Imagem muito grande', body: 'Limite 5 MB.' })
      return
    }
    setUploading(true)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => resolve(r.result as string)
        r.onerror = () => reject(r.error)
        r.readAsDataURL(file)
      })
      const uploaded = await adminUpload.image(base64, 'kore-tech/personas')
      setForm(prev => ({ ...prev, heroImage: uploaded.url }))
    } catch (err) {
      toast.push({ tone: 'error', title: 'Falha no upload', body: err instanceof Error ? err.message : '' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="absolute inset-0 bg-bg/70 backdrop-blur-sm" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative w-full max-w-2xl rounded-xl border border-border bg-surface p-6 shadow-xl animate-scale-in space-y-4 my-8">
        <h2 className="text-lg font-bold text-text">{initial ? 'Editar persona' : 'Nova persona'}</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Valorant 240 FPS" />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" mono value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))} placeholder="valorant-240fps" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Pra quem joga competitivo e quer sustentar 240 FPS no Valorant 1080p high." />
          </div>

          <div className="md:col-span-2">
            <Label>Jogos-alvo</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {form.targetGames.map(g => (
                <span key={g} className="inline-flex items-center gap-1 rounded-pill border border-border bg-surface-2 px-2.5 py-0.5 text-xs text-text">
                  {g}
                  <button type="button" onClick={() => removeGame(g)} aria-label={`Remover ${g}`} className="text-text-muted hover:text-danger">×</button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                value={gameInput}
                onChange={e => setGameInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGame() } }}
                placeholder="Valorant"
              />
              <Button type="button" size="sm" variant="secondary" onClick={addGame} leftIcon={<PlusIcon className="h-3.5 w-3.5" />}>
                Adicionar
              </Button>
            </div>
          </div>

          <div className="md:col-span-2">
            <Label>FPS-alvo</Label>
            <ul className="space-y-1 mt-1">
              {Object.entries(form.targetFps).map(([k, v]) => (
                <li key={k} className="flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-1.5">
                  <span className="flex-1 text-xs text-text font-mono">{k}</span>
                  <span className="font-mono text-sm text-primary">{v} FPS</span>
                  <button type="button" onClick={() => removeFps(k)} aria-label={`Remover ${k}`} className="text-text-muted hover:text-danger">×</button>
                </li>
              ))}
            </ul>
            <div className="mt-2 grid gap-2 md:grid-cols-[2fr_1fr_auto]">
              <Input
                value={fpsKey}
                onChange={e => setFpsKey(e.target.value)}
                placeholder="Valorant 1080p high"
              />
              <Input
                type="number"
                mono
                value={fpsVal}
                onChange={e => setFpsVal(e.target.value)}
                placeholder="FPS"
              />
              <Button type="button" size="sm" variant="secondary" onClick={addFps} leftIcon={<PlusIcon className="h-3.5 w-3.5" />}>
                Adicionar
              </Button>
            </div>
          </div>

          <div className="md:col-span-2">
            <Label>Imagem hero</Label>
            <div className="mt-1 flex items-center gap-3">
              {form.heroImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={form.heroImage} alt="" className="h-20 w-32 rounded-md object-cover ring-1 ring-border" />
              ) : (
                <div className="h-20 w-32 rounded-md bg-surface-2 ring-1 ring-border flex items-center justify-center text-text-muted">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
              <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-primary/40 bg-transparent px-3 text-xs font-semibold text-primary hover:bg-primary-soft">
                {uploading ? 'Enviando…' : (form.heroImage ? 'Trocar imagem' : 'Subir imagem')}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && uploadHero(e.target.files[0])}
                />
              </label>
              {form.heroImage && (
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, heroImage: null }))}
                  className="text-xs text-text-muted hover:text-danger"
                >
                  Remover
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button onClick={() => onSubmit(form)} loading={submitting} disabled={!form.name || !form.slug}>
            {initial ? 'Salvar' : 'Criar persona'}
          </Button>
        </div>
      </div>
    </div>
  )
}
