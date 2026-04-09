import { NextRequest, NextResponse } from 'next/server';

const MINIMAX_API_URL = 'https://api.minimax.io/v1/music_generation';

interface MiniMaxApiResponse {
  base_resp?: {
    status_code: number;
    status_msg: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    const minimalRequest = {
      model: 'music-2.0',
      prompt: 'test',
      output_format: 'url',
      is_instrumental: true,
      audio_setting: {
        sample_rate: 44100,
        bitrate: 256000,
        format: 'mp3',
      },
    };

    const response = await fetch(MINIMAX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(minimalRequest),
    });

    const result: MiniMaxApiResponse = await response.json();

    if (result.base_resp) {
      if (result.base_resp.status_code === 1004 || result.base_resp.status_code === 2049) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your MiniMax API key.' },
          { status: 401 }
        );
      }

      if (result.base_resp.status_code === 1008) {
        return NextResponse.json(
          { error: 'Insufficient balance. Please add credits to your MiniMax account.' },
          { status: 402 }
        );
      }

      if (result.base_resp.status_code === 1002) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      if (result.base_resp.status_code !== 0) {
        return NextResponse.json(
          { error: `API error: ${result.base_resp.status_msg || result.base_resp.status_code}` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ valid: true, message: 'API key is valid' });
  } catch (error) {
    console.error('Test key error:', error);
    return NextResponse.json(
      { error: 'Failed to validate API key' },
      { status: 500 }
    );
  }
}
