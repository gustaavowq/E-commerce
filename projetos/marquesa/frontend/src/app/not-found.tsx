import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="text-center max-w-lg">
        <p className="text-eyebrow uppercase text-ash mb-6">404</p>
        <h1 className="font-display text-display-lg text-ink mb-4">
          Página não encontrada.
        </h1>
        <p className="text-body text-ash mb-8">
          O endereço que você procura saiu do catálogo, mudou de lugar ou nunca existiu.
        </p>
        <Link
          href="/"
          className="inline-block bg-moss text-paper px-8 py-3 font-sans text-body-sm uppercase tracking-[0.04em] hover:bg-moss-deep transition-colors duration-fast"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  )
}
