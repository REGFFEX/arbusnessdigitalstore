-- Migration: Ajout de la position de classement manuel
-- Description: Permet de définir manuellement l'ordre dans le Top 10.

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS ranking_position INTEGER DEFAULT 0;

COMMENT ON COLUMN public.products.ranking_position IS 'Position manuelle dans le classement (1 = Premier). 0 signifie aucun classement manuel.';

-- Index pour accélérer le tri par classement
CREATE INDEX IF NOT EXISTS idx_products_ranking_position ON public.products(ranking_position);
