import { z } from 'zod';

const models = z.enum(['music-2.5+', 'music-2.5', 'music-2.0']);
const sampleRates = z.enum(['16000', '24000', '32000', '44100']);
const bitrates = z.enum(['32000', '64000', '128000', '256000']);
const audioFormats = z.enum(['mp3', 'wav', 'pcm']);
const outputFormats = z.enum(['url', 'hex']);

export const songFormSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(2000, 'Prompt must be 2000 characters or less'),
  model: models.default('music-2.5+'),
  instrumental: z.boolean().default(true),
  autoLyrics: z.boolean().default(false),
  lyrics: z.string().max(3500).optional(),
  sampleRate: sampleRates.default('44100').transform(v => parseInt(v, 10)),
  bitrate: bitrates.default('256000').transform(v => parseInt(v, 10)),
  audioFormat: audioFormats.default('mp3'),
  outputFormat: outputFormats.default('url'),
  lyricsOptimizer: z.boolean().default(false),
  stream: z.boolean().default(false),
  voiceId: z.string().optional(),
  instrumentalId: z.string().optional(),
}).refine(
  (data) => {
    if (!data.instrumental && !data.autoLyrics && (!data.lyrics || data.lyrics.trim().length === 0)) {
      return false;
    }
    return true;
  },
  {
    message: 'Lyrics are required when not instrumental and not using auto-lyrics',
    path: ['lyrics'],
  }
);

export type SongFormData = z.infer<typeof songFormSchema>;

export interface SongResponse {
  id: string;
  prompt: string;
  lyrics: string | null;
  instrumental: boolean;
  autoLyrics: boolean;
  model: string;
  audioUrl: string | null;
  status: string;
  errorMessage: string | null;
  sampleRate: number;
  bitrate: number;
  audioFormat: string;
  outputFormat: string;
  lyricsOptimizer: boolean;
  stream: boolean;
  duration: number | null;
  voiceId: string | null;
  instrumentalId: string | null;
  createdAt: string;
}
