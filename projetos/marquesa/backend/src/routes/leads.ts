// Rotas de Leads — formulário de interesse num imóvel (sem pagamento).
// Público (mas se autenticado, linka userId pro lead).
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { created, errors } from '../lib/api-response.js'
import { createLeadSchema } from '../validators/lead.js'

export const leadsRouter: Router = Router()

leadsRouter.post('/', async (req, res, next) => {
  try {
    const body = createLeadSchema.parse(req.body)

    const imovel = await prisma.imovel.findUnique({
      where: { id: body.imovelId },
      select: { id: true, status: true },
    })
    if (!imovel) throw errors.notFound('Imóvel não encontrado')
    if (imovel.status === 'INATIVO') throw errors.badRequest('Imóvel indisponível')

    // Lead + bump de lastInteractionAt do imóvel em transação atômica.
    // Se o update do imóvel falhar, lead também não persiste — KPI do Analyst
    // exige consistência entre interação e timestamp.
    const lead = await prisma.$transaction(async (tx) => {
      const newLead = await tx.lead.create({
        data: {
          imovelId: body.imovelId,
          userId:   req.user?.id ?? null,
          nome:     body.nome,
          email:    body.email,
          telefone: body.telefone,
          mensagem: body.mensagem,
        },
        select: { id: true, createdAt: true },
      })
      await tx.imovel.update({
        where: { id: body.imovelId },
        data:  { lastInteractionAt: newLead.createdAt },
      })
      return newLead
    })

    return created(res, { lead, message: 'Recebemos seu interesse. Em breve um corretor entra em contato.' })
  } catch (err) {
    next(err)
  }
})
