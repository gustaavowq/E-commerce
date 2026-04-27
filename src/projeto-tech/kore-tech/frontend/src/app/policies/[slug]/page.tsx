import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { POLICIES, POLICY_SLUGS, type PolicySlug } from './content'

type Params = { slug: string }

export function generateStaticParams(): Array<Params> {
  return POLICY_SLUGS.map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const policy = POLICIES[params.slug as PolicySlug]
  if (!policy) return { title: 'Politica' }
  return {
    title: policy.title,
    description: policy.summary,
  }
}

export default function PolicyPage({ params }: { params: Params }) {
  const policy = POLICIES[params.slug as PolicySlug]
  if (!policy) notFound()

  return (
    <main className="container-app py-8 sm:py-12">
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar pra home
      </Link>

      <article className="mt-4 max-w-3xl">
        <header>
          <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">Politica</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-text sm:text-4xl">{policy.title}</h1>
          <p className="mt-2 text-sm text-text-secondary">{policy.summary}</p>
          <p className="mt-2 text-xs text-text-muted">Atualizado em 2026-04-26.</p>
        </header>

        <div className="mt-8 space-y-6">
          {policy.sections.map((sec, i) => (
            <section key={i}>
              <h2 className="font-display text-xl font-bold text-text">{sec.heading}</h2>
              <div className="mt-2 space-y-3 text-sm leading-relaxed text-text-secondary sm:text-base">
                {sec.paragraphs?.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
                {sec.bullets && (
                  <ul className="ml-5 list-disc space-y-1">
                    {sec.bullets.map((b, k) => (
                      <li key={k}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-10 border-t border-border pt-6 text-xs text-text-muted">
          Esse documento e um modelo institucional. Versoes legais finais estao sendo revisadas pelo juridico antes do
          lancamento publico. Em caso de duvida, abra contato pelo WhatsApp ou email.
        </footer>

        <nav className="mt-8 grid gap-2 sm:grid-cols-2">
          {POLICY_SLUGS.filter((s) => s !== params.slug).map((s) => (
            <Link
              key={s}
              href={`/policies/${s}`}
              className="rounded-md border border-border bg-surface p-3 text-sm transition hover:border-primary/40"
            >
              <span className="font-semibold text-text">{POLICIES[s].title}</span>
              <span className="block text-xs text-text-secondary">{POLICIES[s].summary}</span>
            </Link>
          ))}
        </nav>
      </article>
    </main>
  )
}
