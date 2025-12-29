import { generateText as rorkGenerateText } from '@rork-ai/toolkit-sdk';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: ({ type: 'text'; text: string } | { type: 'image'; image: string })[];
}

export async function generateText(config: { messages: Message[] }): Promise<string> {
  try {
    console.log('[AI] Sending request to Rork AI...');
    console.log('[AI] EXPO_PUBLIC_TOOLKIT_URL:', process.env.EXPO_PUBLIC_TOOLKIT_URL);
    console.log('[AI] Message count:', config.messages.length);

    const formattedMessages = config.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    console.log('[AI] Formatted messages:', JSON.stringify(formattedMessages[0], null, 2).substring(0, 500));

    const result = await rorkGenerateText({
      messages: formattedMessages as any,
    });

    console.log('[AI] Response received successfully');
    return result;
  } catch (error: any) {
    console.error('[AI] Detailed error:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack?.substring(0, 500),
      status: error?.status,
      statusText: error?.statusText,
      response: error?.response,
    });
    throw new Error(error?.message || 'Failed to generate text');
  }
}
