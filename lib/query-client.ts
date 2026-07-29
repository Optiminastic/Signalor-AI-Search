import { QueryClient, defaultShouldDehydrateQuery, isServer } from '@tanstack/react-query'

import { ApiError } from '@/lib/api/client'

/**
 * Retry transport failures, never the server's considered answer.
 *
 * Retrying a 4xx cannot succeed — the request is the problem — and on 429 it is
 * actively harmful: the one response that means "you are sending too much" was
 * being answered by sending more, which is how a rate limit became a dashboard
 * that would not load.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
  return failureCount < 1
}

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
      },
      dehydrate: {
        shouldDehydrateQuery: query =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}
