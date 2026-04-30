'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { LeadForm } from '@/components/loja/LeadForm'
import { ReservaCheckout } from '@/components/loja/ReservaCheckout'
import { microcopy } from '@/lib/microcopy'
import type { ImovelDetail } from '@/types/api'

export function ImovelActions({ imovel }: { imovel: ImovelDetail }) {
  const [openLead, setOpenLead] = useState(false)
  const [openReserva, setOpenReserva] = useState(false)

  const reservavel = imovel.status === 'DISPONIVEL'

  return (
    <div className="flex flex-col gap-3">
      {reservavel ? (
        <Button onClick={() => setOpenReserva(true)} className="w-full">
          {microcopy.pdp.reservar_sinal}
        </Button>
      ) : (
        <Button disabled className="w-full">
          Indisponível para reserva
        </Button>
      )}
      <Button variant="secondary" onClick={() => setOpenLead(true)} className="w-full">
        {microcopy.pdp.tenho_interesse}
      </Button>
      <p className="text-caption text-ash leading-relaxed mt-2">
        Após o sinal pago, o imóvel é retirado do catálogo e o corretor responsável conduz a
        negociação por 10 dias corridos.
      </p>

      <Modal
        open={openLead}
        onClose={() => setOpenLead(false)}
        title={microcopy.lead.titulo}
        size="md"
      >
        <p className="text-body text-ash mb-6">{microcopy.lead.subtitulo}</p>
        <LeadForm imovelId={imovel.id} onSuccess={() => setTimeout(() => setOpenLead(false), 2500)} />
      </Modal>

      {reservavel && (
        <ReservaCheckout
          open={openReserva}
          onClose={() => setOpenReserva(false)}
          imovel={imovel}
        />
      )}
    </div>
  )
}
