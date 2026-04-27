// Upload de imagens via Cloudinary. Aceita base64 (data URI) ou URL pública.
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
  configured = true
} else if (cloudName && apiKey && apiSecret) {
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })
  configured = true
} else {
  console.warn('[upload] Cloudinary não configurado (CLOUDINARY_URL ou trio CLOUDINARY_*). Endpoint vai retornar 503.')
}

const uploadSchema = z.object({
  source: z.string().min(1).max(15_000_000),
  folder: z.string().max(80).default('kore-tech/products'),
  tags:   z.array(z.string().max(40)).max(10).optional(),
}).strict()

adminUploadRouter.post('/', async (req, res, next) => {
  try {
    if (!configured) throw errors.serviceUnavailable('Upload indisponível: Cloudinary não configurado')
    const body = uploadSchema.parse(req.body)

    const result = await cloudinary.uploader.upload(body.source, {
      folder: body.folder,
      tags:   body.tags,
      resource_type: 'image',
      transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
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
