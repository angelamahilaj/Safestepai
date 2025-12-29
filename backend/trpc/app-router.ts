import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import analyzeRoute from "./routes/vision/analyze/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  vision: createTRPCRouter({
    analyze: analyzeRoute,
  }),
});

export type AppRouter = typeof appRouter;
