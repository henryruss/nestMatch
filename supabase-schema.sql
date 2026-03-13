-- NestMatch Database Schema
-- Run this in the Supabase SQL Editor

-- Sessions table
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  room_type TEXT NOT NULL,
  player1_name TEXT NOT NULL,
  player2_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'swiping',
  player1_elo_complete BOOLEAN DEFAULT FALSE,
  player2_elo_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Swipes table
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
  player_number INTEGER NOT NULL CHECK (player_number IN (1, 2)),
  photo_id TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  decision TEXT NOT NULL CHECK (decision IN ('yes', 'no')),
  subcategory TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ELO comparisons table
CREATE TABLE elo_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
  player_number INTEGER NOT NULL CHECK (player_number IN (1, 2)),
  winner_photo_id TEXT NOT NULL,
  loser_photo_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photo scores table
CREATE TABLE photo_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
  photo_id TEXT NOT NULL,
  player1_elo INTEGER DEFAULT 1500,
  player2_elo INTEGER DEFAULT 1500,
  combined_elo INTEGER DEFAULT 1500
);

-- Indexes for performance
CREATE INDEX idx_swipes_session ON swipes(session_id);
CREATE INDEX idx_swipes_session_player ON swipes(session_id, player_number);
CREATE INDEX idx_elo_comparisons_session ON elo_comparisons(session_id);
CREATE INDEX idx_photo_scores_session ON photo_scores(session_id);

-- Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE swipes;
ALTER PUBLICATION supabase_realtime ADD TABLE elo_comparisons;
ALTER PUBLICATION supabase_realtime ADD TABLE photo_scores;

-- Row Level Security (permissive for this app since we don't have auth)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE elo_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on swipes" ON swipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on elo_comparisons" ON elo_comparisons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on photo_scores" ON photo_scores FOR ALL USING (true) WITH CHECK (true);
