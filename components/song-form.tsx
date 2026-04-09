'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { SongFormData, SongResponse } from '@/lib/validation';

interface SongFormProps {
  onSongGenerated: (song: SongResponse) => void;
  onGenerationStart: () => void;
  onGenerationEnd: () => void;
}

const PRESETS = [
  { label: 'Cinematic', prompt: 'Epic orchestral cinematic soundtrack with dramatic crescendos' },
  { label: 'Lo-Fi', prompt: 'Chill lo-fi beats with vinyl crackle and mellow piano' },
  { label: 'Ambient', prompt: 'Atmospheric ambient soundscape with soft pads and nature sounds' },
  { label: 'Synthwave', prompt: 'Retro synthwave with pulsing bass and neon vibes' },
];

const EXAMPLE_PROMPT = 'A dreamy ambient track with soft synths and gentle percussion';

export default function SongForm({ onSongGenerated, onGenerationStart, onGenerationEnd }: SongFormProps) {
  const [prompt, setPrompt] = useState(EXAMPLE_PROMPT);
  const [model, setModel] = useState('music-2.5+');
  const [instrumental, setInstrumental] = useState(true);
  const [autoLyrics, setAutoLyrics] = useState(false);
  const [lyrics, setLyrics] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePresetClick = (presetPrompt: string) => {
    setPrompt(presetPrompt);
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success('Prompt copied to clipboard');
    } catch {
      toast.error('Failed to copy prompt');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!instrumental && !autoLyrics && !lyrics.trim()) {
      toast.error('Please provide lyrics or enable auto-lyrics');
      return;
    }

    setIsSubmitting(true);
    onGenerationStart();

    const formData: SongFormData = {
      prompt,
      model,
      instrumental,
      autoLyrics,
      lyrics: lyrics || undefined,
    };

    try {
      const response = await fetch('/api/generate-song', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate song');
      }

      onSongGenerated(result);
      toast.success('Song generated successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate song';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      onGenerationEnd();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg p-6 border border-gray-800 space-y-6">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
          Prompt
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          placeholder="Describe the music you want to generate..."
          required
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="text-xs text-gray-400 hover:text-white"
          >
            Copy
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePresetClick(preset.prompt)}
              className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full border border-gray-700 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="model" className="block text-sm font-medium text-gray-300 mb-2">
          Model
        </label>
        <select
          id="model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="music-2.5+">music-2.5+ (Recommended)</option>
          <option value="music-2.0">music-2.0</option>
          <option value="music-1.0">music-1.0</option>
        </select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="instrumental"
            checked={instrumental}
            onChange={(e) => {
              setInstrumental(e.target.checked);
              if (e.target.checked) {
                setAutoLyrics(false);
              }
            }}
            className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="instrumental" className="text-sm text-gray-300">
            Instrumental (no vocals)
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="autoLyrics"
            checked={autoLyrics}
            onChange={(e) => {
              setAutoLyrics(e.target.checked);
              if (e.target.checked) {
                setInstrumental(false);
              }
            }}
            className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="autoLyrics" className="text-sm text-gray-300">
            Auto-generate lyrics
          </label>
        </div>

        {!instrumental && !autoLyrics && (
          <div>
            <label htmlFor="lyrics" className="block text-sm font-medium text-gray-300 mb-2">
              Lyrics
            </label>
            <textarea
              id="lyrics"
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Enter your lyrics here..."
            />
          </div>
        )}
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Audio Settings</h3>
        <div className="grid grid-cols-3 gap-4 text-xs text-gray-400">
          <div>
            <span className="block text-gray-500">Sample Rate</span>
            <span>44100 Hz</span>
          </div>
          <div>
            <span className="block text-gray-500">Bitrate</span>
            <span>256000 bps</span>
          </div>
          <div>
            <span className="block text-gray-500">Format</span>
            <span>MP3</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        {isSubmitting ? 'Generating...' : 'Generate Song'}
      </button>
    </form>
  );
}
