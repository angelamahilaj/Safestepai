import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  try {
    const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
    
    if (!baseUrl) {
      console.warn('[tRPC] EXPO_PUBLIC_RORK_API_BASE_URL not found, using fallback');
      return 'http://localhost:3000';
    }

    return baseUrl;
  } catch (error) {
    console.error('[tRPC] Error getting base URL:', error);
    return 'http://localhost:3000';
  }
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
