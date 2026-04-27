import type { Metadata } from 'next'
import Link from 'next/link'
import { Wrench, BellRing, ShieldCheck, Cpu, MessageCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Sobre a Kore Tech',
  description:
    'A Kore Tech monta PCs com checagem automatica de compatibilidade, builds organizados por uso e lista de espera anti-paper-launch.',
}

export default function SobrePage() {
  return (
    <main>
      <section className="border-b border-border bg-bg">
        <div className="container-app py-14 sm:py-20">
          <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">Sobre</p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold leading-tight text-text sm:text-5xl">
            Hardware serio, montado certo, no FPS que voce queria.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-text-secondary sm:text-lg">
            A Kore Tech existe pra resolver os tres problemas que mais doem em quem compra PC no Brasil: peca
            incompativel, paper launch sem aviso, e PC montado sem provar quanto roda. Resolvemos os tres com tres
            sistemas que ninguem junta: builder com checagem visivel, catalogo por persona com FPS estimado, e lista de
            espera com reserva de 24h.
          </p>
        </div>
      </section>

      <section className="container-app grid gap-4 py-12 sm:grid-cols-3">
        {[
          {
            icon: Wrench,
            title: 'Builder com 50+ checks',
            text: 'Socket, fonte, gabinete, RAM. Voce escolhe a peca, a gente garante que funciona junto.',
          },
          {
            icon: Cpu,
            title: 'FPS estimado por jogo',
            text: 'Cada PC montado mostra quanto roda em Valorant, Fortnite, Cyberpunk. Curado manualmente.',
          },
          {
            icon: BellRing,
            title: 'Lista de espera ativa',
            text: 'GPU sumiu? Avisamos por email/WhatsApp e reservamos 24h pra primeiros da fila.',
          },
        ].map((it, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-surface p-6 transition hover:border-primary/40"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary-soft text-primary">
              <it.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-base font-bold text-text">{it.title}</h3>
            <p className="mt-2 text-sm text-text-secondary">{it.text}</p>
          </div>
        ))}
      </section>

      <section className="border-y border-border bg-surface/50">
        <div className="container-app py-12 sm:py-16">
          <div className="max-w-3xl">
            <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">Como nasceu</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-text sm:text-3xl">
              Comecou com a duvida: "Esse PC roda mesmo o que prometeram?"
            </h2>
            <div className="mt-5 space-y-4 text-sm text-text-secondary sm:text-base">
              <p>
                A Kore Tech surgiu da frustacao de comprar PC montado e descobrir, depois, que a fonte estava no
                limite, a GPU mal cabia no gabinete, e o FPS prometido na descricao tinha letra miuda. Em outra ponta,
                quem queria montar do zero ficava perdido em planilha, calculando wattagem na unha.
              </p>
              <p>
                Juntamos os dois mundos: voce monta no nosso builder e a checagem aparece em tempo real. Se preferir
                peca pronta, escolhe pelo uso (Valorant 240 FPS, Edicao 4K, IA local com Llama). Em ambos os casos,
                voce ve quanto roda antes de pagar.
              </p>
              <p>
                Lista de espera nao e gambiarra. E sistema. Quando uma GPU some, voce ativa o "me avise" e a gente
                segura 24h pra voce no momento que volta. Sem inflar fila com bots, sem prioridade pra quem grita mais
                alto.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-app py-12 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            { label: 'Checks de compatibilidade', value: '50+' },
            { label: 'Builds prontos curados', value: '8 personas' },
            { label: 'Pix com desconto', value: '5% off' },
          ].map((s, i) => (
            <div key={i} className="rounded-lg border border-border bg-surface p-6 text-center">
              <p className="font-specs text-4xl font-bold text-primary">{s.value}</p>
              <p className="mt-1 text-sm text-text-secondary">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-app pb-16">
        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary-soft to-bg p-8 sm:p-12">
          <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-display text-2xl font-bold text-text sm:text-3xl">
                Pronto pra montar o seu?
              </h2>
              <p className="mt-2 max-w-xl text-sm text-text-secondary">
                Abre o builder, escolhe a primeira peca, deixa a Kore Tech filtrar o resto. Em 5 minutos voce tem PC com
                fonte certa e gabinete que comporta a GPU.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/montar">
                <Button size="lg" className="cta-glow">
                  <Wrench className="h-4 w-4" /> Abrir o builder
                </Button>
              </Link>
              <Link href="/contato">
                <Button size="lg" variant="outline">
                  <MessageCircle className="h-4 w-4" /> Falar com a gente
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-app pb-16">
        <ul className="grid grid-cols-2 gap-4 text-xs text-text-secondary sm:grid-cols-4">
          {[
            ['Pagamento', 'Pix com 5% off, 12x sem juros, boleto'],
            ['Frete', 'Frete asseguro+ pra Brasil todo'],
            ['Garantia', '7 dias troca DOA, garantia legal'],
            ['Atendimento', 'WhatsApp + email + central de pedido'],
          ].map(([title, desc]) => (
            <li key={title} className="rounded-md border border-border bg-surface/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-text">{title}</p>
              <p className="mt-1">{desc}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-app pb-16">
        <Link
          href="/policies/garantia"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Politicas de garantia, troca e privacidade <ArrowRight className="h-3 w-3" />
        </Link>
      </section>
    </main>
  )
}
