import OpenAI from 'openai';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: ({ type: 'text'; text: string } | { type: 'image'; image: string })[];
}

let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY.');
    }
    
    openaiInstance = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  
  return openaiInstance;
}

export async function generateText(config: { messages: Message[] }): Promise<string> {
  try {
    console.log('[AI] Sending request to OpenAI...');
    console.log('[AI] Message count:', config.messages.length);

    const formattedMessages = config.messages.map((msg) => {
      const content = msg.content.map((item) => {
        if (item.type === 'text') {
          return {
            type: 'text' as const,
            text: item.text,
          };
        } else {
          return {
            type: 'image_url' as const,
            image_url: {
              url: item.image,
            },
          };
        }
      });

      return {
        role: msg.role,
        content,
      };
    });

    const openai = getOpenAI();
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: formattedMessages as any,
      max_tokens: 1000,
    });

    const result = response.choices[0]?.message?.content || '';
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
