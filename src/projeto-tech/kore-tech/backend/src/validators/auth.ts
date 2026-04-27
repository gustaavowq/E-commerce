import { z } from 'zod'

const cpfRegex = /^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/

// Blocklist de senhas óbvias. Inclui as do Miami pentest + variações Kore.
const COMMON_PASSWORDS = new Set([
  '12345678', '123456789', '1234567890',
  'password', 'password1', 'password123',
  'qwerty', 'qwerty123', 'qwertyuiop',
  'abcd1234', 'abc12345', 'admin123', 'admin1234',
  'miami2026', 'miamistore',
  'koretech', 'koretech2026', 'kore1234', 'koretech123',
  'gamer123', 'gamer1234', 'pcgamer123',
  'letmein', 'welcome', 'iloveyou', 'monkey', 'dragon',
])

const strongPassword = z.string()
  .min(10, 'Senha precisa ter no mínimo 10 caracteres')
  .max(128, 'Senha muito longa')
  .regex(/[A-Za-z]/, 'Senha precisa conter ao menos uma letra')
  .regex(/[0-9]/,    'Senha precisa conter ao menos um número')
  .regex(/[^A-Za-z0-9]/, 'Senha precisa conter ao menos um caractere especial (ex: !@#$%)')
  .refine(p => !COMMON_PASSWORDS.has(p.toLowerCase()), 'Senha muito comum, escolhe outra')

export const registerSchema = z.object({
  email:    z.string().email('Email inválido').toLowerCase().trim(),
  password: strongPassword,
  name:     z.string().min(2, 'Nome muito curto').max(100).trim(),
  phone:    z.string().min(10).max(20).optional(),
  cpf:      z.string().regex(cpfRegex, 'CPF inválido').optional(),
  // CRÍTICO: NÃO aceita "role" no body. Cadastro público sempre cria CUSTOMER.
  // .strip() (default) silenciosamente ignora campos extras.
})

export const loginSchema = z.object({
  email:    z.string().email('Email inválido').toLowerCase().trim(),
  password: z.string().min(1, 'Senha obrigatória'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase().trim(),
})

export const resetPasswordSchema = z.object({
  token:    z.string().min(20, 'Token inválido'),
  password: strongPassword,
})

export type RegisterInput        = z.infer<typeof registerSchema>
export type LoginInput           = z.infer<typeof loginSchema>
export type ForgotPasswordInput  = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput   = z.infer<typeof resetPasswordSchema>
