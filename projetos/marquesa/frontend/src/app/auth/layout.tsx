import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="container-marquesa py-6">
        <Link
          href="/"
          className="font-display text-heading-lg tracking-[0.16em] text-ink uppercase"
        >
          Marquesa
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}
