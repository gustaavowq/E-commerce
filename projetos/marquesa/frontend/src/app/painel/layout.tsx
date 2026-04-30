import { PainelSidebar } from '@/components/painel/PainelSidebar'
import { RoleGate } from './RoleGate'

export const metadata = {
  title: 'Painel',
  robots: { index: false, follow: false },
}

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper-warm flex flex-col md:flex-row">
      <PainelSidebar />
      <RoleGate>
        <main className="flex-1 px-4 md:px-10 py-8 md:py-12 max-w-[1400px]">{children}</main>
      </RoleGate>
    </div>
  )
}
