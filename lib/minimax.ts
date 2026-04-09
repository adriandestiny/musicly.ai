import { SongFormData } from './validation';

const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

interface MiniMaxResponse {
  id: string;
  choices: Array<{
    finish_reason: string;
    messages: Array<{
      role: string;
      content: string;
    }>;
  }>;
}

export class MiniMaxError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'MiniMaxError';
  }
}

export async function generateSong(data: SongFormData): Promise<{ audioUrl: string; rawResponse: string }> {
  const apiKey = process.env.MINIMAX_API_KEY;
  
  if (!apiKey) {
    throw new MiniMaxError('MINIMAX_API_KEY is not configured');
  }

  const requestBody: Record<string, unknown> = {
    model: data.model,
    messages: [
      {
        role: 'user',
        content: data.prompt,
      },
    ],
  };

  if (!data.instrumental) {
    requestBody.tools = [
      {
        type: 'function',
        function: {
          name: 'generate_music',
          description: 'Generate music with lyrics or instrumental',
          parameters: {
            type: 'object',
            properties: {
              lyrics: {
                type: 'string',
                description: 'The lyrics for the song',
              },
              instrumental: {
                type: 'boolean',
                description: 'Whether the song should be instrumental',
              },
            },
          },
        },
      },
    ];
  }

  try {
    const response = await fetch(MINIMAX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new MiniMaxError(
        `MiniMax API error: ${response.status} - ${errorText}`,
        response.status
      );
    }

    const result: MiniMaxResponse = await response.json();
    
    const musicContent = result.choices?.[0]?.messages?.[1]?.content;
    if (!musicContent) {
      throw new MiniMaxError('No music generation response from MiniMax API');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(musicContent);
    } catch {
      parsedResponse = { audio_url: musicContent };
    }

    const audioUrl = parsedResponse.audio_url || parsedResponse.audioUrl || musicContent;

    return {
      audioUrl,
      rawResponse: JSON.stringify(result),
    };
  } catch (error) {
    if (error instanceof MiniMaxError) {
      throw error;
    }
    throw new MiniMaxError(
      `Failed to call MiniMax API: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
