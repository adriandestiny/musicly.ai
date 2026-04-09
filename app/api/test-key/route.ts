import { NextRequest, NextResponse } from 'next/server';

const MINIMAX_API_URL = 'https://api.minimax.io/v1/music_generation';

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

    const response = await fetch(MINIMAX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'music-2.5+',
        prompt: 'test',
        output_format: 'url',
        is_instrumental: true,
      }),
    });

    const result = await response.json();

    if (result.base_resp) {
      if (result.base_resp.status_code === 1004 || result.base_resp.status_code === 2049) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }
      if (result.base_resp.status_code === 1008) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 402 }
        );
      }
      if (result.base_resp.status_code === 1002) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        );
      }
      if (result.base_resp.status_code !== 0) {
        return NextResponse.json(
          { error: result.base_resp.status_msg || 'API error' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Test key error:', error);
    return NextResponse.json(
      { error: 'Failed to validate API key' },
      { status: 500 }
    );
  }
}
