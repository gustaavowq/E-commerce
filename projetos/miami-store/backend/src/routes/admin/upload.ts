// Upload de imagens via Cloudinary. Aceita base64 (data URI) ou URL pública.
// Retorna a URL pública do Cloudinary pra ser salva no Product.images.
//
// Setup:
//   1. Conta em cloudinary.com
//   2. Define CLOUDINARY_URL no Railway (ou CLOUDINARY_CLOUD_NAME + KEY + SECRET)
//   3. Painel admin manda dataURI (FileReader) → backend faz upload → devolve URL
//
// Tamanho: limita a 10MB já no nivel do express (client_max_body_size do nginx
// também é 10MB). Cloudinary aceita até 100MB free, mas pra fotos de produto
// 10MB é generoso.
import { Router } from 'express'
import { z } from 'zod'
import { v2 as cloudinary } from 'cloudinary'
import { ok, errors } from '../../lib/api-response.js'

export const adminUploadRouter: Router = Router()

const cloudinaryUrl = process.env.CLOUDINARY_URL
const cloudName     = process.env.CLOUDINARY_CLOUD_NAME
const apiKey        = process.env.CLOUDINARY_API_KEY
const apiSecret     = process.env.CLOUDINARY_API_SECRET

let configured = false
if (cloudinaryUrl) {
  // CLOUDINARY_URL formato: cloudinary://KEY:SECRET@CLOUD_NAME — SDK lê automatic
  configured = true
} else if (cloudName && apiKey && apiSecret) {
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })
  configured = true
} else {
  console.warn('[upload] Cloudinary não configurado (CLOUDINARY_URL ou trio CLOUDINARY_*). Endpoint vai retornar 503.')
}

const uploadSchema = z.object({
  // Aceita data URI (data:image/jpeg;base64,...) OU URL pública
  source: z.string().min(1).max(15_000_000),  // 15MB de string ~ 10MB binário em base64
  folder: z.string().max(80).default('miami-store/products'),
  // Tags opcionais pra organizar no Cloudinary
  tags:   z.array(z.string().max(40)).max(10).optional(),
}).strict()

// POST /api/admin/upload — upload de imagem
adminUploadRouter.post('/', async (req, res, next) => {
  try {
    if (!configured) throw errors.serviceUnavailable('Upload indisponível: Cloudinary não configurado')
    const body = uploadSchema.parse(req.body)

    const result = await cloudinary.uploader.upload(body.source, {
      folder: body.folder,
      tags:   body.tags,
      // Otimização automática (auto-format/quality reduz tamanho ~70% pro browser)
      resource_type: 'image',
      transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
      // Limita tamanho final pra evitar foto absurda
      eager: [{ width: 1200, height: 1500, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }],
    })

    return ok(res, {
      url:       result.secure_url,
      publicId:  result.public_id,
      width:     result.width,
      height:    result.height,
      bytes:     result.bytes,
      format:    result.format,
      thumbnail: result.eager?.[0]?.secure_url ?? result.secure_url,
    })
  } catch (err) {
    console.error('[upload] falhou', err)
    next(err)
  }
})
