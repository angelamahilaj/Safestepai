import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: ({ type: 'text'; text: string } | { type: 'image'; image: string })[];
}

export async function generateText(config: { messages: Message[] }): Promise<string> {
  try {
    console.log('[OpenAI] Sending request to OpenAI...');

    const openaiMessages = config.messages.map((msg) => {
      const content = msg.content.map((item) => {
        if (item.type === 'text') {
          return { type: 'text' as const, text: item.text };
        } else {
          return {
            type: 'image_url' as const,
            image_url: { url: item.image },
          };
        }
      });

      return {
        role: msg.role as 'user',
        content,
      };
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: openaiMessages,
      max_tokens: 500,
    });

    const result = response.choices[0]?.message?.content || '';
    console.log('[OpenAI] Response received successfully');
    return result;
  } catch (error: any) {
    console.error('[OpenAI] Error:', error);
    throw new Error(error?.message || 'Failed to generate text');
  }
}
