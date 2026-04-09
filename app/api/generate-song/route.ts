import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { songFormSchema, SongResponse } from '@/lib/validation';
import { generateSong, MiniMaxError } from '@/lib/minimax';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiKeyFromHeader = request.headers.get('X-MINIMAX-API-KEY') || undefined;
    
    const validationResult = songFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const song = await prisma.song.create({
      data: {
        prompt: data.prompt,
        model: data.model,
        instrumental: data.instrumental,
        autoLyrics: data.autoLyrics,
        lyrics: data.lyrics || null,
        sampleRate: data.sampleRate,
        bitrate: data.bitrate,
        audioFormat: data.audioFormat,
        outputFormat: data.outputFormat,
        lyricsOptimizer: data.lyricsOptimizer,
        stream: data.stream,
        voiceId: data.voiceId || null,
        instrumentalId: data.instrumentalId || null,
        status: 'processing',
      },
    });

    try {
      const result = await generateSong(data, apiKeyFromHeader);

      const updatedSong = await prisma.song.update({
        where: { id: song.id },
        data: {
          audioUrl: result.audioUrl,
          rawResponse: result.rawResponse,
          status: 'completed',
        },
      });

      const response: SongResponse = {
        id: updatedSong.id,
        prompt: updatedSong.prompt,
        lyrics: updatedSong.lyrics,
        instrumental: updatedSong.instrumental,
        autoLyrics: updatedSong.autoLyrics,
        model: updatedSong.model,
        audioUrl: updatedSong.audioUrl,
        status: updatedSong.status,
        errorMessage: updatedSong.errorMessage,
        sampleRate: updatedSong.sampleRate,
        bitrate: updatedSong.bitrate,
        audioFormat: updatedSong.audioFormat,
        outputFormat: updatedSong.outputFormat,
        lyricsOptimizer: updatedSong.lyricsOptimizer,
        stream: updatedSong.stream,
        duration: result.duration || null,
        voiceId: updatedSong.voiceId,
        instrumentalId: updatedSong.instrumentalId,
        createdAt: updatedSong.createdAt.toISOString(),
      };

      return NextResponse.json(response, { status: 201 });
    } catch (apiError) {
      const errorMessage = apiError instanceof MiniMaxError 
        ? apiError.message 
        : 'Failed to generate song';

      await prisma.song.update({
        where: { id: song.id },
        data: {
          status: 'failed',
          errorMessage,
        },
      });

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Generate song error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const songs = await prisma.song.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const response: SongResponse[] = songs.map((song) => ({
      id: song.id,
      prompt: song.prompt,
      lyrics: song.lyrics,
      instrumental: song.instrumental,
      autoLyrics: song.autoLyrics,
      model: song.model,
      audioUrl: song.audioUrl,
      status: song.status,
      errorMessage: song.errorMessage,
      sampleRate: song.sampleRate,
      bitrate: song.bitrate,
      audioFormat: song.audioFormat,
      outputFormat: song.outputFormat,
      lyricsOptimizer: song.lyricsOptimizer,
      stream: song.stream,
      duration: song.duration,
      voiceId: song.voiceId,
      instrumentalId: song.instrumentalId,
      createdAt: song.createdAt.toISOString(),
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get songs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}