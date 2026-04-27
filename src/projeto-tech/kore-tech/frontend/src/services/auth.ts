import { apiGet, apiPost } from './api'
import type { AuthPayload, User } from './types'

export async function register(input: { email: string; password: string; name: string; phone?: string; cpf?: string }) {
  return apiPost<AuthPayload>('/auth/register', input)
}

export async function login(input: { email: string; password: string }) {
  return apiPost<AuthPayload>('/auth/login', input)
}

export async function logout() {
  return apiPost<{ message: string }>('/auth/logout')
}

export async function refreshSession() {
  return apiPost<AuthPayload>('/auth/refresh')
}

export async function forgotPassword(email: string) {
  return apiPost<{ message: string; _devResetUrl?: string }>('/auth/forgot-password', { email })
}

export async function resetPassword(input: { token: string; password: string }) {
  return apiPost<{ message: string; user: User }>('/auth/reset-password', input)
}

export async function getMe() {
  return apiGet<{ user: User }>('/auth/me')
}
