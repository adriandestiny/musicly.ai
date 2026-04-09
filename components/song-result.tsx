'use client';

import { SongResponse } from '@/lib/validation';
import { formatDistanceToNow } from '@/lib/utils';

interface SongResultProps {
  song: SongResponse;
}

export default function SongResult({ song }: SongResultProps) {
  const isCompleted = song.status === 'completed';
  const isFailed = song.status === 'failed';

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShare = async () => {
    if (navigator.share && song.audioUrl) {
      try {
        await navigator.share({
          title: 'MiniMax Song Forge',
          text: song.prompt,
          url: song.audioUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  const handleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!favorites.includes(song.id)) {
      favorites.push(song.id);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  };

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
        <div className="mb-4 space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="waveform-visualization h-16 mb-2">
              <canvas id={`waveform-${song.id}`} className="w-full h-full" />
            </div>
            <audio 
              controls 
              className="w-full h-10"
              src={song.audioUrl}
            >
              Your browser does not support the audio element.
            </audio>
          </div>

          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Duration</div>
              <div className="text-lg font-mono text-white">{formatDuration(song.duration)}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Sample Rate</div>
              <div className="text-sm font-mono text-white">{song.sampleRate} Hz</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Bitrate</div>
              <div className="text-sm font-mono text-white">{(song.bitrate / 1000).toFixed(0)}k</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Format</div>
              <div className="text-sm font-mono text-white">{song.audioFormat.toUpperCase()}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href={song.audioUrl}
              download={`song-${song.id}.mp3`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
            <button
              onClick={handleShare}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
            <button
              onClick={handleFavorite}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3 text-sm border-t border-gray-800 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Prompt: </span>
          <span className="text-gray-300 text-right max-w-xs truncate">{song.prompt}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-500">Model: </span>
          <span className="text-gray-300">{song.model}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-500">Mode: </span>
          <span className="text-gray-300">
            {song.instrumental ? 'Instrumental' : song.autoLyrics ? 'Auto-lyrics' : 'With lyrics'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-500">Output: </span>
          <span className="text-gray-300">{song.outputFormat}</span>
        </div>

        {song.stream && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Streaming: </span>
            <span className="text-green-400">Enabled</span>
          </div>
        )}

        {song.lyrics && (
          <div>
            <span className="text-gray-500 block mb-1">Lyrics: </span>
            <div className="bg-gray-800/50 rounded p-3 text-gray-300 whitespace-pre-wrap text-xs max-h-32 overflow-y-auto">
              {song.lyrics}
            </div>
          </div>
        )}

        <div className="text-gray-500 text-xs pt-2 border-t border-gray-800">
          Generated {formatDistanceToNow(new Date(song.createdAt))} ago
        </div>
      </div>
    </div>
  );
}
