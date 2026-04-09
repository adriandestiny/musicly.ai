import { z } from 'zod';

export const songFormSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(500, 'Prompt too long'),
  model: z.string().default('music-2.5+'),
  instrumental: z.boolean().default(true),
  autoLyrics: z.boolean().default(false),
  lyrics: z.string().optional(),
}).refine(
  (data) => {
    if (!data.instrumental && !data.autoLyrics && !data.lyrics) {
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
  createdAt: string;
}
