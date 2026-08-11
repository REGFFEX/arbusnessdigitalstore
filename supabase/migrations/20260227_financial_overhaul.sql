-- Migration Phase 28: Overhaul Financier & Metadata
-- Ajout des colonnes pour Euro, Ads Logic et Configuration d'affichage

-- 1. Table PRODUCTS
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS custom_source_suffix text,
ADD COLUMN IF NOT EXISTS price_eur numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS ads_video_count int DEFAULT 0,
ADD COLUMN IF NOT EXISTS ads_video_price numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS display_config jsonb DEFAULT '{"show_usd": true, "show_fcfa": true, "show_eur": true}'::jsonb;

-- 2. Table SERVICES
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS custom_source_suffix text,
ADD COLUMN IF NOT EXISTS price_eur numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS ads_video_count int DEFAULT 0,
ADD COLUMN IF NOT EXISTS ads_video_price numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS display_config jsonb DEFAULT '{"show_usd": true, "show_fcfa": true, "show_eur": true}'::jsonb;

-- Commentaires pour l'admin / dev
COMMENT ON COLUMN public.products.custom_source_suffix IS 'Suffixe personnalisé pour les sources externes (ex: PlayStore).';
COMMENT ON COLUMN public.products.price_eur IS 'Prix du produit en Euro.';
COMMENT ON COLUMN public.products.ads_video_count IS 'Nombre de vidéos Ad à regarder pour débloquer (si accès reward).';
COMMENT ON COLUMN public.products.ads_video_price IS 'Valeur monétaire estimée d''une vidéo (utilisé pour le calcul du prix direct).';
COMMENT ON COLUMN public.products.display_config IS 'Préférences d''affichage des prix et monnaies.';
