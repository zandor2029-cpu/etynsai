-- Create renders table to store user-generated images and videos
CREATE TABLE public.renders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  prompt TEXT,
  model TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.renders ENABLE ROW LEVEL SECURITY;

-- Users can view their own renders
CREATE POLICY "Users can view own renders"
  ON public.renders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own renders
CREATE POLICY "Users can insert own renders"
  ON public.renders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own renders
CREATE POLICY "Users can delete own renders"
  ON public.renders
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_renders_user_id ON public.renders(user_id);
CREATE INDEX idx_renders_created_at ON public.renders(created_at DESC);