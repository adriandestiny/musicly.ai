'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { SongFormData, SongResponse } from '@/lib/validation';

interface SongForgeProps {
  onSongGenerated: (song: SongResponse) => void;
  onGenerationStart: () => void;
  onGenerationEnd: () => void;
}

const PRESETS = [
  { label: 'Cinematic', prompt: 'Epic orchestral cinematic soundtrack with dramatic crescendos' },
  { label: 'Lo-Fi', prompt: 'Chill lo-fi beats with vinyl crackle and mellow piano' },
  { label: 'Ambient', prompt: 'Atmospheric ambient soundscape with soft pads and nature sounds' },
  { label: 'Synthwave', prompt: 'Retro synthwave with pulsing bass and neon vibes' },
  { label: 'Blues', prompt: 'Smooth blues with soulful guitar and piano' },
  { label: 'Electronic', prompt: 'Energetic electronic dance music with driving beats' },
  { label: 'Pop', prompt: 'Catchy pop anthem with memorable hooks' },
  { label: 'Rock', prompt: 'Powerful rock anthem with distorted guitars' },
  { label: 'Jazz', prompt: 'Smooth jazz with saxophone and piano improvisation' },
  { label: 'Classical', prompt: 'Classical orchestral piece with strings and woodwinds' },
  { label: 'Hip-Hop', prompt: 'Hip-hop beat with heavy bass and urban vibes' },
  { label: 'Country', prompt: 'Country ballad with acoustic guitar and fiddle' },
];

const LYRICS_TAGS = [
  '[Intro]', '[Verse]', '[Pre-Chorus]', '[Chorus]', '[Hook]', '[Drop]',
  '[Bridge]', '[Solo]', '[Build Up]', '[Inst]', '[Outro]',
];

const MODELS = [
  { value: 'music-2.5+', label: 'music-2.5+', desc: 'Latest model, highest quality (Recommended)' },
  { value: 'music-2.5', label: 'music-2.5', desc: 'Enhanced quality with faster generation' },
  { value: 'music-2.0', label: 'music-2.0', desc: 'Stable model with good balance' },
];

const SAMPLE_RATES = [16000, 24000, 32000, 44100];
const BITRATES = [32000, 64000, 128000, 256000];
const FORMATS = ['mp3', 'wav', 'pcm'];
const OUTPUT_FORMATS = ['url', 'hex'];

const STORAGE_KEY = 'minimax_api_key';

export default function SongForge({ onSongGenerated, onGenerationStart, onGenerationEnd }: SongForgeProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [saveToBrowser, setSaveToBrowser] = useState(false);
  const [usingLocalKey, setUsingLocalKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const [prompt, setPrompt] = useState('A dreamy ambient track with soft synths and gentle percussion');
  const [model, setModel] = useState<'music-2.5+' | 'music-2.5' | 'music-2.0'>('music-2.5+');
  const [instrumental, setInstrumental] = useState(true);
  const [autoLyrics, setAutoLyrics] = useState(false);
  const [lyrics, setLyrics] = useState('');
  const [lyricsOptimizer, setLyricsOptimizer] = useState(false);
  const [sampleRate, setSampleRate] = useState(44100);
  const [bitrate, setBitrate] = useState(256000);
  const [format, setFormat] = useState<'mp3' | 'wav' | 'pcm'>('mp3');
  const [outputFormat, setOutputFormat] = useState<'url' | 'hex'>('url');
  const [stream, setStream] = useState(false);
  const [voiceId, setVoiceId] = useState('');
  const [instrumentalId, setInstrumentalId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem(STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
      setSaveToBrowser(true);
      setUsingLocalKey(true);
    }
  }, []);

  const handleSaveToBrowserChange = (checked: boolean) => {
    setSaveToBrowser(checked);
    if (checked && apiKey) {
      localStorage.setItem(STORAGE_KEY, apiKey);
      setUsingLocalKey(true);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setUsingLocalKey(false);
    }
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    if (saveToBrowser && value) {
      localStorage.setItem(STORAGE_KEY, value);
      setUsingLocalKey(true);
    } else {
      setUsingLocalKey(!!localStorage.getItem(STORAGE_KEY));
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key first');
      return;
    }

    setTestingConnection(true);
    try {
      const response = await fetch('/api/test-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to validate API key');
      }

      toast.success('API key validated successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to validate API key';
      toast.error(message);
    } finally {
      setTestingConnection(false);
    }
  };

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

  const insertLyricsTag = (tag: string) => {
    setLyrics((prev) => prev + tag + ' ');
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
      lyricsOptimizer,
      sampleRate,
      bitrate,
      audioFormat: format,
      outputFormat,
      stream,
      voiceId: voiceId || undefined,
      instrumentalId: instrumentalId || undefined,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey && usingLocalKey) {
      headers['X-MINIMAX-API-KEY'] = apiKey;
    }

    try {
      const response = await fetch('/api/generate-song', {
        method: 'POST',
        headers,
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

  const handleInstrumentalChange = (checked: boolean) => {
    setInstrumental(checked);
    if (checked) {
      setAutoLyrics(false);
    }
  };

  const handleAutoLyricsChange = (checked: boolean) => {
    setAutoLyrics(checked);
    if (checked) {
      setInstrumental(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg border border-gray-800">
      <div className="p-6 space-y-6">
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-300 mb-2">
            Model
          </label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value as 'music-2.5+' | 'music-2.5' | 'music-2.0')}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label} - {m.desc}
              </option>
            ))}
          </select>
        </div>

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
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{prompt.length} chars</span>
            </div>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">Genre Presets</label>
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
          <label htmlFor="lyrics" className="block text-sm font-medium text-gray-300 mb-2">
            Lyrics
          </label>
          <textarea
            id="lyrics"
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="Enter your lyrics here..."
            disabled={instrumental}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">{lyrics.split('\n').length} lines</span>
            <div className="flex flex-wrap gap-1">
              {LYRICS_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => insertLyricsTag(tag)}
                  className="px-2 py-0.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 rounded border border-gray-700"
                  disabled={instrumental}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-300">Mode</h3>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="instrumental"
              checked={instrumental}
              onChange={(e) => handleInstrumentalChange(e.target.checked)}
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
              onChange={(e) => handleAutoLyricsChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="autoLyrics" className="text-sm text-gray-300">
              Auto-generate lyrics
            </label>
          </div>

          {(!instrumental || autoLyrics) && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="lyricsOptimizer"
                checked={lyricsOptimizer}
                onChange={(e) => setLyricsOptimizer(e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="lyricsOptimizer" className="text-sm text-gray-300">
                Lyrics Optimizer (auto-generate/enhance lyrics)
              </label>
            </div>
          )}

          <p className="text-xs text-gray-500">
            Language hint: English and Mandarin are best supported
          </p>

          {!instrumental && (
            <div>
              <label htmlFor="voiceId" className="block text-sm font-medium text-gray-300 mb-2">
                Voice Reference (voice_id)
              </label>
              <input
                type="text"
                id="voiceId"
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter voice reference ID..."
              />
            </div>
          )}

          <div>
            <label htmlFor="instrumentalId" className="block text-sm font-medium text-gray-300 mb-2">
              Instrumental Reference (instrumental_id)
            </label>
            <input
              type="text"
              id="instrumentalId"
              value={instrumentalId}
              onChange={(e) => setInstrumentalId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter instrumental reference ID..."
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="sampleRate" className="block text-sm font-medium text-gray-300 mb-2">
              Sample Rate
            </label>
            <select
              id="sampleRate"
              value={sampleRate}
              onChange={(e) => setSampleRate(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {SAMPLE_RATES.map((sr) => (
                <option key={sr} value={sr}>
                  {sr} Hz
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bitrate" className="block text-sm font-medium text-gray-300 mb-2">
              Bitrate
            </label>
            <select
              id="bitrate"
              value={bitrate}
              onChange={(e) => setBitrate(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {BITRATES.map((br) => (
                <option key={br} value={br}>
                  {(br / 1000).toFixed(0)}k bps
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="format" className="block text-sm font-medium text-gray-300 mb-2">
              Format
            </label>
            <select
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value as 'mp3' | 'wav' | 'pcm')}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="outputFormat" className="block text-sm font-medium text-gray-300 mb-2">
              Output Format
            </label>
            <select
              id="outputFormat"
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as 'url' | 'hex')}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {OUTPUT_FORMATS.map((of) => (
                <option key={of} value={of}>
                  {of === 'url' ? 'URL (Recommended)' : of.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="stream"
                checked={stream}
                onChange={(e) => setStream(e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="stream" className="text-sm text-gray-300">
                Enable Streaming
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <button
          type="button"
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="w-full px-6 py-3 flex items-center justify-between text-gray-400 hover:text-white transition-colors"
        >
          <span className="text-sm font-medium">Settings</span>
          <svg
            className={`w-5 h-5 transition-transform ${settingsOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {settingsOpen && (
          <div className="px-6 pb-6 space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
                MiniMax API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your MiniMax API key..."
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="saveToBrowser"
                checked={saveToBrowser}
                onChange={(e) => handleSaveToBrowserChange(e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="saveToBrowser" className="text-sm text-gray-300">
                Save to browser (localStorage)
              </label>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  usingLocalKey ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
                }`}
              >
                {usingLocalKey ? 'Using local key' : 'Using server key'}
              </span>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection || !apiKey.trim()}
                className="px-4 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-300 rounded-lg transition-colors"
              >
                {testingConnection ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pb-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          {isSubmitting ? 'Generating...' : 'Generate Song'}
        </button>
      </div>
    </form>
  );
}
