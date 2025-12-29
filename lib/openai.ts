import { generateText as rorkGenerateText } from '@rork-ai/toolkit-sdk';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: ({ type: 'text'; text: string } | { type: 'image'; image: string })[];
}

export async function generateText(config: { messages: Message[] }): Promise<string> {
  try {
    console.log('[AI] Sending request to Rork AI...');

    const formattedMessages = config.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const result = await rorkGenerateText({
      messages: formattedMessages as any,
    });

    console.log('[AI] Response received successfully');
    return result;
  } catch (error: any) {
    console.error('[AI] Error:', error);
    throw new Error(error?.message || 'Failed to generate text');
  }
}
