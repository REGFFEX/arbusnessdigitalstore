-- Migration: Ajout des champs sociaux et QR code à la table admins
-- Date: 2026-02-25
-- Description: Ajoute les champs téléphone, WhatsApp, GitHub, Facebook, TikTok et QR code URL aux profils admins

-- Ajout des nouveaux champs à la table admins
ALTER TABLE admins 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS github TEXT,
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS tiktok TEXT,
ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

-- Commentaires pour la documentation
COMMENT ON COLUMN admins.phone IS 'Numéro de téléphone professionnel de l''admin';
COMMENT ON COLUMN admins.whatsapp IS 'Numéro WhatsApp pour contact direct';
COMMENT ON COLUMN admins.github IS 'Username GitHub pour lien vers profil';
COMMENT ON COLUMN admins.facebook IS 'URL complète du profil Facebook';
COMMENT ON COLUMN admins.tiktok IS 'URL complète du profil TikTok';
COMMENT ON COLUMN admins.qr_code_url IS 'URL du QR code contenant les infos professionnelles';
