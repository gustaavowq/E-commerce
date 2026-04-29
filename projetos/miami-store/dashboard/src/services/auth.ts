import { api, post } from '@/lib/api'
import type { AuthPayload, AdminUser } from './types'

export async function login(input: { email: string; password: string }) {
  return post<AuthPayload>('/auth/login', input)
}

export async function logout() {
  return post<{ message: string }>('/auth/logout')
}

export async function logoutAll() {
  return post<{ message: string; revoked: number }>('/auth/logout-all')
}

export async function forgotPassword(email: string) {
  return post<{ message: string; _devResetUrl?: string }>('/auth/forgot-password', { email })
}

export async function resetPassword(input: { token: string; password: string }) {
  return post<{ message: string; user: AdminUser }>('/auth/reset-password', input)
}

export async function getMe() {
  return api<{ user: AdminUser }>('/auth/me')
}
