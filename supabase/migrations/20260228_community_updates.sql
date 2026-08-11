-- Migration: Community Evolution (Soft Delete & Edit tracking)
ALTER TABLE public.community_posts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Update existing rows to have updated_at equals created_at if null
UPDATE public.community_posts 
SET updated_at = created_at 
WHERE updated_at IS NULL;
