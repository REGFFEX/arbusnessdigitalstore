-- Migration: Ajout des colonnes manquantes à center_posts
-- Description: Ajoute block_id, block_order et layout_config si elles n'existent pas

DO $$ 
BEGIN
    -- block_id
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'center_posts' AND column_name = 'block_id') THEN
        ALTER TABLE public.center_posts ADD COLUMN block_id TEXT;
    END IF;

    -- block_order
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'center_posts' AND column_name = 'block_order') THEN
        ALTER TABLE public.center_posts ADD COLUMN block_order INTEGER DEFAULT 0;
    END IF;

    -- layout_config
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'center_posts' AND column_name = 'layout_config') THEN
        ALTER TABLE public.center_posts ADD COLUMN layout_config JSONB DEFAULT '{"width": "100%", "aspectRatio": "auto", "objectFit": "cover"}'::jsonb;
    END IF;
END $$;

-- Index pour block_id
CREATE INDEX IF NOT EXISTS idx_center_posts_block ON public.center_posts(block_id);
