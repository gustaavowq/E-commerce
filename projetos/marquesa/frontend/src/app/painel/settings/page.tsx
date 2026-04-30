'use client'

import { useAuth } from '@/hooks/useAuth'

export default function PainelSettingsPage() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <header>
        <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">Painel</p>
        <h1 className="font-display text-display-lg text-ink">Configurações</h1>
      </header>

      <section className="border border-bone bg-paper p-8">
        <h2 className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-4">Conta</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Nome" value={user?.name} />
          <Field label="Email" value={user?.email} />
          <Field label="Perfil" value={user?.role} />
        </dl>
      </section>

      <section className="border border-bone bg-paper p-8">
        <h2 className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-4">
          Configurações da loja
        </h2>
        <p className="text-body text-ash">
          Configurações de site (CRECI, sinal default, MercadoPago) são gerenciadas via env vars
          do backend e seed inicial. Em V2 entram aqui editáveis via API.
        </p>
      </section>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-eyebrow uppercase tracking-[0.16em] text-ash text-caption">{label}</dt>
      <dd className="text-body text-ink mt-1">{value ?? '—'}</dd>
    </div>
  )
}
