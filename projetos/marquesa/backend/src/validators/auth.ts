// Validadores Zod pra rotas de auth.
// Senha: 8 chars mínimo (bcrypt + rate-limit já protegem). Blocklist anti senhas comuns.
// Decisão tech-lead 2026-04-30: alinhar com frontend, UX moderna sem requisito
// de char especial. Anti-bruteforce vem do rate-limit no /login + /register.
import { z } from 'zod'

const COMMON_PASSWORDS = new Set([
  '12345678', '123456789', '1234567890',
  'password', 'password1', 'password123',
  'qwerty123', 'qwertyuiop',
  'abcd1234', 'abc12345', 'admin123', 'admin1234',
  'marquesa1', 'marquesa2026',
  'iloveyou',
])

const strongPassword = z.string()
  .min(8, 'Senha precisa ter pelo menos 8 caracteres')
  .max(128, 'Senha muito longa')
  .refine(p => !COMMON_PASSWORDS.has(p.toLowerCase()), 'Senha muito comum, escolhe outra')

export const registerSchema = z.object({
  email:    z.string().email('Email inválido').toLowerCase().trim(),
  password: strongPassword,
  name:     z.string().min(2, 'Nome muito curto').max(100).trim(),
  phone:    z.string().min(10).max(20).optional(),
  // CRÍTICO: NÃO aceita "role" no body. Cadastro público sempre cria USER.
  // .strip() (default Zod) ignora silenciosamente — não usamos .strict().
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
