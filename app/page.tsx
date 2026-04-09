'use client';

import { useState } from 'react';
import SongForm from '@/components/song-form';
import SongResult from '@/components/song-result';
import { SongResponse } from '@/lib/validation';
import Link from 'next/link';

export default function Home() {
  const [currentSong, setCurrentSong] = useState<SongResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSongGenerated = (song: SongResponse) => {
    setCurrentSong(song);
  };

  const handleGenerationStart = () => {
    setIsGenerating(true);
  };

  const handleGenerationEnd = () => {
    setIsGenerating(false);
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MiniMax Song Forge
            </span>
          </h1>
          <p className="text-lg text-gray-400">
            Generate AI-powered music with your prompts
          </p>
          <div className="mt-4">
            <Link 
              href="/history" 
              className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              View History →
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          <SongForm 
            onSongGenerated={handleSongGenerated}
            onGenerationStart={handleGenerationStart}
            onGenerationEnd={handleGenerationEnd}
          />

          {isGenerating && (
            <div className="bg-gray-900 rounded-lg p-8 text-center border border-gray-800">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-400">Generating your song...</p>
            </div>
          )}

          {currentSong && !isGenerating && (
            <SongResult song={currentSong} />
          )}
        </div>
      </div>
    </main>
  );
}
