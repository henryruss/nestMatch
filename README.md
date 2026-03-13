# NestMatch

A shared home design taste-matching experience for couples. Swipe through interior design photos independently, rank your favorites, and discover your AI-generated "dream room" together.

## Setup

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the contents of `supabase-schema.sql` to create all tables
3. Copy your project URL and anon key from Settings > API

### 2. Anthropic

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)

### 3. Unsplash (Optional)

The app works without an Unsplash API key! If the key is missing, it falls back to beautiful free photos from [Picsum Photos](https://picsum.photos).

To use real Unsplash photos instead:
1. Create a free developer account at [unsplash.com/developers](https://unsplash.com/developers)
2. Create a new application and copy the Access Key
3. Add it to your `.env`

### 4. Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

- `VITE_SUPABASE_URL` — required
- `VITE_SUPABASE_ANON_KEY` — required
- `ANTHROPIC_API_KEY` — required
- `VITE_UNSPLASH_ACCESS_KEY` — optional (will use mock photos if empty)

### 5. Install Dependencies

From the project root:

```bash
npm install
cd server && npm install
cd ..
```

### 6. Run

**Terminal 1** (frontend):
```bash
npm run dev
```
→ App opens at `http://localhost:5173`

**Terminal 2** (backend):
```bash
cd server && npm run dev
```
→ API server runs on `http://localhost:3001`

## How It Works

1. **Create a session** — pick a room type and enter two names
2. **Swipe** — each person independently swipes through 50 interior design photos across 5 subcategories
3. **Rank** — both people rank their shared favorites in head-to-head matchups
4. **Reveal** — see your combined dream room with AI-generated descriptions, a mood board, and style analysis

## Tech Stack

- **React** + Vite (frontend)
- **Tailwind CSS** (styling)
- **Supabase** (database + real-time sync)
- **Unsplash API** (photos)
- **Claude API** (AI-generated style summaries)
- **Framer Motion** (animations)
