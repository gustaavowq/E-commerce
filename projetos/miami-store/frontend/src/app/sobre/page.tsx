import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ShieldCheck, Truck, Heart, Award, Users, Sparkles, MessageCircle } from 'lucide-react'

export const metadata = {
  title: 'Sobre a Miami Store',
  description: 'A história da Miami Store: roupa de marca original com preço que cabe no bolso. Conheça nossa missão, valores e por que mais de 5 mil clientes confiam na gente.',
}

export const revalidate = 3600

export default function SobrePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden className="absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary-700/30 blur-3xl" />
        <div aria-hidden className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

        <div className="container-app relative py-12 sm:py-20">
          <nav className="mb-4 text-xs text-ink-4 animate-fade-up">
            <Link href="/" className="hover:text-white">Início</Link>
            <span className="mx-1.5">›</span>
            <span className="text-white">Sobre</span>
          </nav>
          <p className="text-sm font-bold uppercase tracking-widest text-neon animate-fade-up" style={{ animationDelay: '50ms' }}>
            Quem somos
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl leading-tight sm:text-5xl lg:text-6xl animate-fade-up" style={{ animationDelay: '100ms' }}>
            Roupa <span className="text-shine">original</span> não precisa ser cara.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-ink-4 sm:text-lg animate-fade-up" style={{ animationDelay: '200ms' }}>
            A Miami Store nasceu em 2020 com uma ideia simples: trazer Lacoste, Nike, Adidas e Tommy direto pro seu guarda-roupa, com preço justo e a confiança de produto autêntico.
          </p>
        </div>
      </section>

      {/* Números */}
      <section className="border-y border-border bg-white">
        <div className="container-app grid grid-cols-2 gap-6 py-10 sm:grid-cols-4 sm:py-14">
          {[
            { num: '5.000+', label: 'Clientes felizes', icon: Users },
            { num: '15.000+', label: 'Pedidos entregues', icon: Truck },
            { num: '4.9/5', label: 'Avaliação média', icon: Award },
            { num: '100%', label: 'Produtos originais', icon: ShieldCheck },
          ].map((it, i) => (
            <div key={i} className="text-center animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-pill bg-primary-50 text-primary-700">
                <it.icon className="h-6 w-6" />
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">{it.num}</p>
              <p className="mt-1 text-xs text-ink-3 sm:text-sm">{it.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Missão / História */}
      <section className="container-app py-12 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="animate-fade-up">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-700">Nossa missão</p>
            <h2 className="mt-2 font-display text-2xl text-ink sm:text-4xl">
              Preço bom não é sinônimo de produto ruim.
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink-2 sm:text-base">
              <p>
                A gente começou cansado de ver gente boa pagando o triplo do preço pra ter uma peça de marca. Falamos com distribuidores autorizados, cortamos atravessador e passamos esse desconto pra quem importa: você.
              </p>
              <p>
                Toda peça que sai daqui tem caixa, etiqueta, código de autenticidade e nota fiscal eletrônica. Se chegar diferente, devolve sem dor de cabeça. Frete por nossa conta.
              </p>
              <p>
                Hoje somos um time pequeno em São Paulo, atendendo o Brasil inteiro. Crescemos no Insta com o boca a boca de quem comprou e gostou.
              </p>
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-primary-700 animate-scale-in">
            <Image
              src="/marketing/comunidade.jpg"
              alt="Comunidade Miami Store"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <p className="font-display text-2xl text-white">@miamii_storee</p>
              <p className="text-sm text-white/90">+8 mil seguidores compartilhando looks reais</p>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="bg-surface-alt py-12 sm:py-20">
        <div className="container-app">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-700">No que a gente acredita</p>
            <h2 className="mt-2 font-display text-2xl text-ink sm:text-4xl">Nossos valores</h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: 'Autenticidade primeiro',
                text: 'Nada de réplica, nada de pirata. Se a etiqueta não bate, a peça não sai daqui.',
              },
              {
                icon: Heart,
                title: 'Cliente é gente',
                text: 'Atendimento humano no Zap, sem robô. Você fala direto com quem resolve.',
              },
              {
                icon: Sparkles,
                title: 'Preço transparente',
                text: 'Sem letra miúda, sem juros escondidos. O que você vê é o que paga.',
              },
              {
                icon: Truck,
                title: 'Frete justo',
                text: 'R$ 15 fixo pro Brasil todo. Sem cobrar fortuna por morar longe.',
              },
              {
                icon: Award,
                title: 'Compromisso com o erro',
                text: 'Se a gente errar, conserta. Troca, devolve, ou faz de novo. Sem enrolação.',
              },
              {
                icon: Users,
                title: 'Comunidade Miami',
                text: 'Cliente vira família. Marcou a gente no Insta? Ganha cupom no próximo pedido.',
              },
            ].map((v, i) => (
              <div
                key={i}
                className="group rounded-lg border border-border bg-white p-5 transition-all hover:-translate-y-1 hover:border-primary-700/30 hover:shadow-lg animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-primary-50 text-primary-700 transition-transform group-hover:scale-110 group-hover:rotate-6">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-bold text-ink">{v.title}</h3>
                <p className="mt-2 text-sm text-ink-3 leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="container-app py-12 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-700">Sem mistério</p>
          <h2 className="mt-2 font-display text-2xl text-ink sm:text-4xl">Como a gente trabalha</h2>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            { num: '01', title: 'Compra direto', text: 'A gente compra direto de distribuidores autorizados, sem atravessador inflando o preço.' },
            { num: '02', title: 'Confere peça por peça', text: 'Tudo passa por inspeção: caixa, etiqueta, costura, código de barras.' },
            { num: '03', title: 'Manda rápido', text: 'Pedido aprovado até 14h sai no mesmo dia. Pix cai e a gente já tá embalando.' },
          ].map((s, i) => (
            <div
              key={i}
              className="relative rounded-lg border border-border bg-white p-6 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="absolute -top-3 left-6 rounded-md bg-primary-700 px-3 py-1 font-display text-sm font-bold text-white">
                {s.num}
              </span>
              <h3 className="mt-2 font-display text-lg text-ink">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-3 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="container-app pb-16">
        <div className="relative overflow-hidden rounded-xl bg-primary-700 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <div aria-hidden className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-neon/20 blur-3xl" />
          <h2 className="font-display text-2xl sm:text-4xl">Bora vestir bonito?</h2>
          <p className="mt-3 text-white/95 sm:text-lg">
            Coleção atualizada toda semana. Pix dá 5% off. Frete fixo R$ 15.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-base font-semibold text-primary-700 transition-all hover:gap-3 hover:bg-primary-50"
            >
              Ver coleção
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contato"
              className="inline-flex items-center gap-2 rounded-md border border-white/40 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              <MessageCircle className="h-4 w-4" />
              Falar com a gente
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
