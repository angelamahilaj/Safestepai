import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import OpenAI from 'openai';

export default publicProcedure
  .input(
    z.object({
      imageBase64: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      console.log('[Text API] Processing text reading request');
      console.log('[Text API] Image size:', input.imageBase64.length);
      console.log('[Text API] API Key present:', !!process.env.EXPO_PUBLIC_OPENAI_API_KEY);

      const openai = new OpenAI({
        apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extrakto dhe lexo të gjithë tekstin e dukshëm nga kjo imazh në shqip. Përfshi të gjitha fjalët, numrat, etiketat, shenjat dhe çdo përmbajtje të shkruar. Nëse nuk ka tekst, thuaj "Nuk u gjet tekst i lexueshëm në këtë imazh".',
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
      console.log('[Text API] Text reading completed successfully');
      
      return { text: result };
    } catch (error: any) {
      console.error('[Text API] Detailed error:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack?.substring(0, 500),
        status: error?.status,
        statusText: error?.statusText,
      });
      throw new Error(error?.message || 'Failed to read text');
    }
  });
