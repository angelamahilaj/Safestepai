import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

export default publicProcedure
  .input(
    z.object({
      imageBase64: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      console.log('[Currency API] Processing currency identification request');
      console.log('[Currency API] Image size:', input.imageBase64.length);

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Identifiko çdo valutë (bankënota ose monedha) në këtë imazh. Specifiko vlerën, llojin e valutës (Lekë, USD, EUR, GBP, etj.), dhe çdo detaj tjetër relevant. Nëse ka disa kartëmonedha ose monedha, listoji të gjitha. Nëse nuk ka valutë të dukshme, thuaj "Nuk u zbulua valutë në këtë imazh" në shqip.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: input.imageBase64,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      const result = response.choices[0]?.message?.content || '';
      console.log('[Currency API] Identification completed successfully');
      
      return { result };
    } catch (error: any) {
      console.error('[Currency API] Detailed error:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack?.substring(0, 500),
        status: error?.status,
        statusText: error?.statusText,
      });
      throw new Error(error?.message || 'Failed to identify currency');
    }
  });
