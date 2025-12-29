import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import { generateText } from '@rork-ai/toolkit-sdk';

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

      const result = await generateText({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: input.prompt,
              },
              {
                type: 'image',
                image: input.imageBase64,
              },
            ],
          },
        ],
      });

      console.log('[Vision API] Analysis completed successfully');
      
      return { description: result };
    } catch (error: any) {
      console.error('[Vision API] Error:', error);
      throw new Error(error?.message || 'Failed to analyze image');
    }
  });
