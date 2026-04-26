// Bandeiras de pagamento como SVG inline. Sem dependência de CDN/imagem.
// Cada bandeira fica num card 40x26 com border + bg branco.

type BadgeProps = { className?: string }

function Card({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div
      title={label}
      aria-label={label}
      className="flex h-7 w-11 items-center justify-center rounded-md border border-white/15 bg-white px-1.5 shadow-sm"
    >
      {children}
    </div>
  )
}

export function PixBadge({ className }: BadgeProps) {
  // Pix: 4 losangos formando um "X" — símbolo oficial Banco Central
  return (
    <Card label="Pix">
      <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
        <g fill="#32BCAD">
          <path d="M9.5 15.5l-3-3a3.5 3.5 0 0 1 0-5l3-3a3.5 3.5 0 0 1 5 0l3 3-2 2-3-3a.7.7 0 0 0-1 0l-3 3a.7.7 0 0 0 0 1l3 3z"/>
          <path d="M22.5 15.5l3-3a3.5 3.5 0 0 1 0 5l-3 3a3.5 3.5 0 0 1-5 0l-3-3 2-2 3 3a.7.7 0 0 0 1 0l3-3a.7.7 0 0 0 0-1l-3-3z" transform="translate(0 1)"/>
          <path d="M16 6l4 4-4 4-4-4z"/>
          <path d="M16 18l4 4-4 4-4-4z"/>
        </g>
      </svg>
    </Card>
  )
}

export function VisaBadge({ className }: BadgeProps) {
  return (
    <Card label="Visa">
      <svg viewBox="0 0 64 22" className={className} xmlns="http://www.w3.org/2000/svg">
        <text
          x="32" y="17"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="20"
          fill="#1A1F71"
          letterSpacing="0.5"
        >
          VISA
        </text>
      </svg>
    </Card>
  )
}

export function MastercardBadge({ className }: BadgeProps) {
  return (
    <Card label="Mastercard">
      <svg viewBox="0 0 32 20" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="10" r="7" fill="#EB001B" />
        <circle cx="20" cy="10" r="7" fill="#F79E1B" />
        <path
          d="M16 4.5a7 7 0 0 1 0 11 7 7 0 0 1 0-11z"
          fill="#FF5F00"
        />
      </svg>
    </Card>
  )
}

export function EloBadge({ className }: BadgeProps) {
  // Elo: círculo preto com 3 pontos (amarelo, vermelho, azul)
  return (
    <Card label="Elo">
      <svg viewBox="0 0 40 22" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="9" fill="#000" />
        <circle cx="8.5" cy="9" r="1.4" fill="#FFF200" />
        <circle cx="13" cy="9" r="1.4" fill="#EE2E24" />
        <circle cx="11" cy="13.5" r="1.4" fill="#00A4E0" />
        <text x="22" y="14" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="9" fill="#000">elo</text>
      </svg>
    </Card>
  )
}

export function AmexBadge({ className }: BadgeProps) {
  return (
    <Card label="American Express">
      <svg viewBox="0 0 50 22" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="50" height="22" fill="#1F72CD" rx="2" />
        <text
          x="25" y="14.5"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontWeight="900"
          fontSize="9"
          fill="#FFF"
          letterSpacing="1"
        >
          AMEX
        </text>
      </svg>
    </Card>
  )
}

export function BoletoBadge({ className }: BadgeProps) {
  // Barras verticais imitando código de barras
  return (
    <Card label="Boleto">
      <svg viewBox="0 0 40 22" className={className} xmlns="http://www.w3.org/2000/svg">
        <g fill="#1F2937">
          <rect x="2"  y="3" width="1.5" height="11" />
          <rect x="5"  y="3" width="3"   height="11" />
          <rect x="9"  y="3" width="1"   height="11" />
          <rect x="11" y="3" width="2"   height="11" />
          <rect x="14" y="3" width="1.5" height="11" />
          <rect x="17" y="3" width="2.5" height="11" />
          <rect x="21" y="3" width="1"   height="11" />
          <rect x="23" y="3" width="2"   height="11" />
          <rect x="26" y="3" width="1.5" height="11" />
          <rect x="29" y="3" width="3"   height="11" />
          <rect x="33" y="3" width="1"   height="11" />
          <rect x="35" y="3" width="2"   height="11" />
        </g>
        <text x="20" y="20" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="4.5" fill="#1F2937">BOLETO</text>
      </svg>
    </Card>
  )
}

export function PaymentBadges() {
  return (
    <div className="flex flex-wrap gap-1.5">
      <PixBadge />
      <VisaBadge />
      <MastercardBadge />
      <EloBadge />
      <AmexBadge />
      <BoletoBadge />
    </div>
  )
}
