// bcryptjs (NÃO bcrypt — quebra em container Alpine sem build C++).
// Cost 10 (recomendado pelo brief). Cost 12 também aceitável; 10 é mais leve.
import bcrypt from 'bcryptjs'

const COST = 10

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST)
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed)
}
