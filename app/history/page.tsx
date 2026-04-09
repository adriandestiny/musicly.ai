'use client';

import { useEffect, useState } from 'react';
import SongHistory from '@/components/song-history';
import { SongResponse } from '@/lib/validation';
import Link from 'next/link';

export default function HistoryPage() {
  const [songs, setSongs] = useState<SongResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSongs() {
      try {
        const response = await fetch('/api/generate-song');
        if (!response.ok) {
          throw new Error('Failed to fetch songs');
        }
        const data = await response.json();
        setSongs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchSongs();
  }, []);

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-purple-400 hover:text-purple-300 text-sm font-medium"
          >
            ← Back to Generator
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Generation History
          </h1>
          <p className="mt-2 text-gray-400">
            View all your previously generated songs
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && <SongHistory songs={songs} />}
      </div>
    </main>
  );
}
