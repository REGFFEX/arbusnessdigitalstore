-- Migration: Ajout du groupement et de la mise en page pour center_posts
-- Description: Permet de regrouper plusieurs publications en "blocs" et de configurer leur affichage interne

ALTER TABLE public.center_posts
ADD COLUMN IF NOT EXISTS block_id UUID,
ADD COLUMN IF NOT EXISTS block_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS layout_config JSONB DEFAULT '{}'::jsonb;

-- Index pour accélérer le regroupement
CREATE INDEX IF NOT EXISTS idx_center_posts_block_id ON public.center_posts(block_id);

COMMENT ON COLUMN public.center_posts.block_id IS 'ID de regroupement (pour les messages multi-types)';
COMMENT ON COLUMN public.center_posts.block_order IS 'Ordre d''affichage au sein du bloc';
COMMENT ON COLUMN public.center_posts.layout_config IS 'Configuration de mise en page (tailles, redimensionnements)';
