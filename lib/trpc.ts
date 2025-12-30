import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;

  if (!baseUrl) {
    console.warn(
      "[tRPC] EXPO_PUBLIC_RORK_API_BASE_URL not found, using fallback http://localhost:3000"
    );
    return "http://localhost:3000";
  }

  return baseUrl;
};

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
