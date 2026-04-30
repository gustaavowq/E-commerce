import { QueryClient } from '@tanstack/react-query'

// Cache padrão do app. Painel sobreescreve com staleTime: 0 onde precisa fresco.
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  })
}
