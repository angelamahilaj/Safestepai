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
      console.log('[Vision API] EXPO_PUBLIC_TOOLKIT_URL:', process.env.EXPO_PUBLIC_TOOLKIT_URL);
      console.log('[Vision API] Image size:', input.imageBase64.length);

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
