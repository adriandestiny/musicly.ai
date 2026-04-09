# MiniMax Song Forge

AI-powered music generation web app built with Next.js. Create unique songs using text prompts powered by MiniMax's music generation API.

## Features

- Text-to-music generation using AI
- Custom lyrics support with auto-lyrics option
- Instrumental or vocal track generation
- Generation history tracking
- Real-time status updates
- Dark-themed responsive UI

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite via Prisma ORM
- **API Validation**: Zod
- **Notifications**: Sonner
- **AI Provider**: MiniMax Music Generation API

## Prerequisites

- Node.js 18+
- MiniMax API key (Token Plan)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd minimax-song-forge
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Configure your API key**
   
   Open `.env` and add your MiniMax API key:
   ```
   MINIMAX_API_KEY=your_minimax_token_plan_key_here
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

6. **Set up the database**
   ```bash
   npx prisma db push
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MINIMAX_API_KEY` | Your MiniMax API key from the Token Plan | Yes |
| `DATABASE_URL` | SQLite database path (default: `file:./dev.db`) | Yes (default provided) |

### Getting Your MiniMax API Key

1. Visit [minimax.io](https://www.minimax.io/)
2. Navigate to the Token Plan section
3. Create or access your API key
4. Copy the key and paste it into your `.env` file as `MINIMAX_API_KEY`

## Project Structure

```
├── app/
│   ├── api/
│   │   └── generate-song/
│   │       └── route.ts      # Song generation API endpoint
│   ├── history/
│   │   └── page.tsx          # Generation history page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/
│   ├── song-form.tsx         # Song generation form
│   ├── song-result.tsx       # Generated song display
│   └── song-history.tsx      # History list component
├── lib/
│   ├── minimax.ts            # MiniMax API client
│   └── validation.ts         # Zod schemas
├── prisma/
│   └── schema.prisma         # Database schema
└── .env.example              # Environment template
```

## API

### Generate Song

**POST** `/api/generate-song`

**Request Body:**
```json
{
  "prompt": "A cheerful pop song about summer",
  "model": "music-2.5+",
  "instrumental": true,
  "autoLyrics": false,
  "lyrics": null
}
```

**Response:**
```json
{
  "audioUrl": "https://...",
  "rawResponse": {}
}
```

## Development

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Deploy to Vercel (Recommended)

[Vercel](https://vercel.com) is the easiest way to deploy Next.js applications.

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/minimax-song-forge.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js and configure the build settings

3. **Add Environment Variables**
   - In your Vercel project dashboard, go to "Settings" → "Environment Variables"
   - Add `MINIMAX_API_KEY` with your MiniMax API key
   - The `DATABASE_URL` uses SQLite by default and is automatically configured

4. **Deploy**
   - Click "Deploy" - Vercel will build and deploy your application
   - Your app will be available at `https://your-project.vercel.app`

### Build and Deploy to Any Host

```bash
# Build the production bundle
npm run build

# The build output is in the .next/ directory
# Start the production server
npm start
```

For production deployments, you'll need to set the `MINIMAX_API_KEY` environment variable on your hosting provider.

## Database Schema

The `Song` model stores generation history with the following fields:
- `id` - Unique identifier (CUID)
- `prompt` - Text description for song generation
- `lyrics` - Custom lyrics (optional)
- `instrumental` - Whether to generate instrumental
- `autoLyrics` - Whether to generate auto-lyrics
- `model` - Music model version
- `audioUrl` - Generated audio URL
- `status` - Generation status
- `errorMessage` - Error details if failed
- `rawResponse` - Raw API response
- `createdAt` - Creation timestamp