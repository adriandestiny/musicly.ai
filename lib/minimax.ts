import { SongFormData } from './validation';

const MINIMAX_API_URL = 'https://api.minimax.io/v1/music_generation';

interface MiniMaxMusicResponse {
  data?: {
    audio?: string;
    status: number;
  };
  base_resp?: {
    status_code: number;
    status_msg: string;
  };
  trace_id?: string;
  extra_info?: {
    music_duration?: number;
    music_sample_rate?: number;
    music_channel?: number;
    bitrate?: number;
    music_size?: number;
  };
}

export class MiniMaxError extends Error {
  constructor(message: string, public statusCode?: number, public apiCode?: number) {
    super(message);
    this.name = 'MiniMaxError';
  }
}

export async function generateSong(data: SongFormData, clientApiKey?: string): Promise<{ audioUrl: string; rawResponse: string; duration?: number; sampleRate?: number; bitrate?: number }> {
  const apiKey = clientApiKey || process.env.MINIMAX_API_KEY;

  if (!apiKey) {
    throw new MiniMaxError('MINIMAX_API_KEY is not configured');
  }

  const isInstrumental = data.instrumental;

  const requestBody: Record<string, unknown> = {
    model: data.model,
    prompt: data.prompt,
    output_format: data.outputFormat,
    is_instrumental: isInstrumental,
    stream: data.stream,
    audio_setting: {
      sample_rate: data.sampleRate,
      bitrate: data.bitrate,
      format: data.audioFormat,
    },
  };

  if (!isInstrumental) {
    if (data.lyricsOptimizer) {
      requestBody.lyrics_optimizer = true;
      requestBody.lyrics = data.lyrics || '';
    } else if (data.autoLyrics) {
      requestBody.lyrics_optimizer = true;
      requestBody.lyrics = data.lyrics || '';
    } else {
      requestBody.lyrics = data.lyrics || '';
    }
  }

  if (data.voiceId) {
    requestBody.voice_id = data.voiceId;
  }

  if (data.instrumentalId) {
    requestBody.instrumental_id = data.instrumentalId;
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

    const result: MiniMaxMusicResponse = await response.json();

    if (result.base_resp) {
      if (result.base_resp.status_code === 1004 || result.base_resp.status_code === 2049) {
        throw new MiniMaxError(
          'Invalid API key. Please check your MINIMAX_API_KEY',
          response.status,
          result.base_resp.status_code
        );
      }
      if (result.base_resp.status_code === 1002) {
        throw new MiniMaxError(
          'Rate limit exceeded. Please try again later.',
          response.status,
          result.base_resp.status_code
        );
      }
      if (result.base_resp.status_code === 1008) {
        throw new MiniMaxError(
          'Insufficient balance. Please add credits to your MiniMax account.',
          response.status,
          result.base_resp.status_code
        );
      }
      if (result.base_resp.status_code !== 0) {
        throw new MiniMaxError(
          `MiniMax API error: ${result.base_resp.status_msg || result.base_resp.status_code}`,
          response.status,
          result.base_resp.status_code
        );
      }
    }

    if (result.data?.status === 2 && result.data.audio) {
      return {
        audioUrl: result.data.audio,
        rawResponse: JSON.stringify(result),
        duration: result.extra_info?.music_duration,
        sampleRate: result.extra_info?.music_sample_rate,
        bitrate: result.extra_info?.bitrate,
      };
    }

    throw new MiniMaxError('No audio data in MiniMax API response');
  } catch (error) {
    if (error instanceof MiniMaxError) {
      throw error;
    }
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        throw new MiniMaxError(
          'Failed to connect to MiniMax API. Please check your network connection.',
          undefined,
          undefined
        );
      }
      throw new MiniMaxError(
        `Failed to call MiniMax API: ${error.message}`,
        undefined,
        undefined
      );
    }
    throw new MiniMaxError('Unknown error occurred while calling MiniMax API');
  }
}