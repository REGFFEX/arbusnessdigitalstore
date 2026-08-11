-- Migration: Création de la table download_tokens
-- Description: Gère les jetons de téléchargement sécurisés à usage unique ou temporaires.

CREATE TABLE IF NOT EXISTS public.download_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    bucket TEXT DEFAULT 'files',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    ip_address TEXT -- Optionnel: pour limiter l'usage par IP
);

-- Index pour la performance
CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON public.download_tokens(token);
CREATE INDEX IF NOT EXISTS idx_download_tokens_product_id ON public.download_tokens(product_id);

-- Activer RLS
ALTER TABLE public.download_tokens ENABLE ROW LEVEL SECURITY;

-- Politiques RLS (Permettre l'insertion et la lecture par jeton)
-- On cible explicitement les rôles utilisés par le frontend
DROP POLICY IF EXISTS "Allow public insert" ON public.download_tokens;
DROP POLICY IF EXISTS "Allow public select" ON public.download_tokens;
DROP POLICY IF EXISTS "Allow public update" ON public.download_tokens;
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.download_tokens;
DROP POLICY IF EXISTS "Enable select by token" ON public.download_tokens;
DROP POLICY IF EXISTS "Enable update for used_at" ON public.download_tokens;

CREATE POLICY "Allow public insert" ON public.download_tokens FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public select" ON public.download_tokens FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public update" ON public.download_tokens FOR UPDATE TO anon, authenticated USING (true);

-- GRANTS explicits pour s'assurer que les rôles ont les permissions de base
GRANT ALL ON public.download_tokens TO anon, authenticated;
GRANT ALL ON public.download_tokens TO service_role;

COMMENT ON TABLE public.download_tokens IS 'Stocke les jetons temporaires pour sécuriser les liens de téléchargement.';
