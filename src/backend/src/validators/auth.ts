import { z } from 'zod'

// CPF: validação básica de formato (11 dígitos). Validação de dígito
// verificador fica pra service de checkout.
const cpfRegex = /^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/

export const registerSchema = z.object({
  email:    z.string().email('Email inválido').toLowerCase().trim(),
  password: z.string()
              .min(8, 'Senha precisa ter no mínimo 8 caracteres')
              .max(128, 'Senha muito longa')
              .regex(/[A-Za-z]/, 'Senha precisa conter ao menos uma letra')
              .regex(/[0-9]/, 'Senha precisa conter ao menos um número'),
  name:     z.string().min(2, 'Nome muito curto').max(100).trim(),
  phone:    z.string().min(10).max(20).optional(),
  cpf:      z.string().regex(cpfRegex, 'CPF inválido').optional(),
  // CRÍTICO: NÃO aceita "role" no body. Cadastro público sempre cria CUSTOMER.
  // O controller hardcoda role:'CUSTOMER' — então mesmo que alguém mande
  // role:'ADMIN' no body, o .strip() (default do Zod) ignora silenciosamente.
})  // sem .strict() — campos extras são DROPADOS, não geram erro

export const loginSchema = z.object({
  email:    z.string().email('Email inválido').toLowerCase().trim(),
  password: z.string().min(1, 'Senha obrigatória'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase().trim(),
})

export const resetPasswordSchema = z.object({
  token:    z.string().min(20, 'Token inválido'),
  password: z.string()
              .min(8, 'Senha precisa ter no mínimo 8 caracteres')
              .max(128, 'Senha muito longa')
              .regex(/[A-Za-z]/, 'Senha precisa conter ao menos uma letra')
              .regex(/[0-9]/, 'Senha precisa conter ao menos um número'),
})

export type RegisterInput        = z.infer<typeof registerSchema>
export type LoginInput           = z.infer<typeof loginSchema>
export type ForgotPasswordInput  = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput   = z.infer<typeof resetPasswordSchema>
