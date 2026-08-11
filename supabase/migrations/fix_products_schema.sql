-- Migration: Réparation du Schema Products (Phase 14)
-- Date: 2026-02-25
-- Description: Ajoute les colonnes manquantes pour la formation, les jeux et les partenaires externes.

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS formation_domain TEXT,
ADD COLUMN IF NOT EXISTS formation_level TEXT DEFAULT 'debutant',
ADD COLUMN IF NOT EXISTS formation_certificate TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS formation_monetization TEXT,
ADD COLUMN IF NOT EXISTS game_genre TEXT,
ADD COLUMN IF NOT EXISTS partner_name TEXT,
ADD COLUMN IF NOT EXISTS partner_link TEXT,
ADD COLUMN IF NOT EXISTS partner_qr_url TEXT,
ADD COLUMN IF NOT EXISTS multi_types JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'direct',
ADD COLUMN IF NOT EXISTS versions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS relations JSONB DEFAULT '[]'::jsonb;

-- Suppression d'anciennes contraintes si nécessaire (optionnel)
-- COMMENT ON COLUMN public.products.formation_certificate IS 'Type de certificat délivré pour la formation';
