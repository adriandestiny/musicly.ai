'use client';

import { SongResponse } from '@/lib/validation';
import { formatDistanceToNow } from '@/lib/utils';

interface SongHistoryProps {
  songs: SongResponse[];
}

export default function SongHistory({ songs }: SongHistoryProps) {
  if (songs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No songs generated yet. Go back to the generator to create your first song!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {songs.map((song) => {
        const isCompleted = song.status === 'completed';
        const isFailed = song.status === 'failed';

        return (
          <div 
            key={song.id} 
            className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    isCompleted 
                      ? 'bg-green-900/50 text-green-400' 
                      : isFailed 
                        ? 'bg-red-900/50 text-red-400'
                        : 'bg-yellow-900/50 text-yellow-400'
                  }`}>
                    {song.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(song.createdAt))} ago
                  </span>
                </div>

                <p className="text-sm text-gray-300 truncate mb-1">
                  {song.prompt}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{song.model}</span>
                  <span>{song.instrumental ? 'Instrumental' : 'With vocals'}</span>
                </div>

                {isFailed && song.errorMessage && (
                  <p className="mt-2 text-xs text-red-400 truncate">
                    {song.errorMessage}
                  </p>
                )}
              </div>

              {isCompleted && song.audioUrl && (
                <div className="flex flex-col items-end gap-2">
                  <audio 
                    controls 
                    className="h-8 w-32"
                    src={song.audioUrl}
                  >
                    Your browser does not support the audio element.
                  </audio>
                  <a
                    href={song.audioUrl}
                    download={`song-${song.id}.mp3`}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    Download
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
