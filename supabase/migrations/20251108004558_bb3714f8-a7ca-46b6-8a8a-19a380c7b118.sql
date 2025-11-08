-- Create community posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author TEXT NOT NULL,
  message TEXT NOT NULL,
  kindness_score INTEGER DEFAULT 75,
  avatar_bg TEXT DEFAULT 'bg-gray-100',
  moderation JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Everyone can read posts
CREATE POLICY "Anyone can view community posts"
  ON public.community_posts
  FOR SELECT
  USING (true);

-- Anyone can insert posts (public forum)
CREATE POLICY "Anyone can create community posts"
  ON public.community_posts
  FOR INSERT
  WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX idx_community_posts_created_at ON public.community_posts(created_at DESC);