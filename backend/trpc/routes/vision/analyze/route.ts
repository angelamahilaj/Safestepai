import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import OpenAI from 'openai';

export default publicProcedure
  .input(
    z.object({
      imageBase64: z.string(),
      prompt: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      console.log('[Vision API] Processing image analysis request');
      console.log('[Vision API] Image size:', input.imageBase64.length);
      console.log('[Vision API] API Key present:', !!process.env.EXPO_PUBLIC_OPENAI_API_KEY);

      if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured');
      }

      const openai = new OpenAI({
        apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      });

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: input.prompt,
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
      console.log('[Vision API] Analysis completed successfully');
      
      return { description: result };
    } catch (error: any) {
      console.error('[Vision API] Detailed error:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack?.substring(0, 500),
        status: error?.status,
        statusText: error?.statusText,
      });
      throw new Error(error?.message || 'Failed to analyze image');
    }
  });
