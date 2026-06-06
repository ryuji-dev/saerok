import { QueryClient } from '@tanstack/react-query';

/** Shared React Query client. Wrapped around the app in `src/app/_layout.tsx`. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
