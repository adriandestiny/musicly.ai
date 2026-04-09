'use client';

import { SongResponse } from '@/lib/validation';
import { formatDistanceToNow } from '@/lib/utils';

interface SongResultProps {
  song: SongResponse;
}

export default function SongResult({ song }: SongResultProps) {
  const isCompleted = song.status === 'completed';
  const isFailed = song.status === 'failed';

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Result</h2>
        <span className={`px-2 py-1 text-xs rounded-full ${
          isCompleted 
            ? 'bg-green-900/50 text-green-400' 
            : isFailed 
              ? 'bg-red-900/50 text-red-400'
              : 'bg-yellow-900/50 text-yellow-400'
        }`}>
          {song.status}
        </span>
      </div>

      {isFailed && song.errorMessage && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm">{song.errorMessage}</p>
        </div>
      )}

      {isCompleted && song.audioUrl && (
        <div className="mb-4">
          <audio 
            controls 
            className="w-full h-10"
            src={song.audioUrl}
          >
            Your browser does not support the audio element.
          </audio>
          <div className="mt-2 flex gap-2">
            <a
              href={song.audioUrl}
              download={`song-${song.id}.mp3`}
              className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          </div>
        </div>
      )}

      <div className="space-y-3 text-sm">
        <div>
          <span className="text-gray-500">Prompt: </span>
          <span className="text-gray-300">{song.prompt}</span>
        </div>

        <div>
          <span className="text-gray-500">Mode: </span>
          <span className="text-gray-300">
            {song.instrumental ? 'Instrumental' : song.autoLyrics ? 'Auto-lyrics' : 'With lyrics'}
          </span>
        </div>

        {song.lyrics && (
          <div>
            <span className="text-gray-500 block mb-1">Lyrics: </span>
            <div className="bg-gray-800/50 rounded p-3 text-gray-300 whitespace-pre-wrap text-xs max-h-32 overflow-y-auto">
              {song.lyrics}
            </div>
          </div>
        )}

        <div className="text-gray-500 text-xs">
          Generated {formatDistanceToNow(new Date(song.createdAt))} ago
        </div>
      </div>
    </div>
  );
}
