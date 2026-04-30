// Middleware Next.js — protege /painel/*.
// Decide pela presença do cookie `access_token`. Backend é a fonte de verdade
// (faz a validação real do JWT em cada chamada). Aqui só evita render desnecessário.

import { NextResponse, type NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const accessToken = req.cookies.get('access_token')?.value

  // Painel exige cookie. Sem cookie → manda pra login com redirect param.
  if (pathname.startsWith('/painel')) {
    if (!accessToken) {
      const url = req.nextUrl.clone()
      url.pathname = '/auth/login'
      url.search = `?redirect=${encodeURIComponent(pathname + search)}`
      return NextResponse.redirect(url)
    }
    // Validação real do role acontece no client (useAuth) + backend.
    return NextResponse.next()
  }

  // Login/register/forgot — se já está logado, manda pra home (sem flicker).
  if (
    accessToken &&
    (pathname === '/auth/login' ||
      pathname === '/auth/register' ||
      pathname === '/auth/forgot-password')
  ) {
    const redirect = req.nextUrl.searchParams.get('redirect')
    const url = req.nextUrl.clone()
    url.pathname = redirect && redirect.startsWith('/') ? redirect : '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/painel/:path*', '/auth/:path*'],
}
