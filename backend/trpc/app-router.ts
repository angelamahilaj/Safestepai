import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import analyzeRoute from "./routes/vision/analyze/route";
import identifyRoute from "./routes/currency/identify/route";
import readRoute from "./routes/text/read/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  vision: createTRPCRouter({
    analyze: analyzeRoute,
  }),
  currency: createTRPCRouter({
    identify: identifyRoute,
  }),
  text: createTRPCRouter({
    read: readRoute,
  }),
});

export type AppRouter = typeof appRouter;
