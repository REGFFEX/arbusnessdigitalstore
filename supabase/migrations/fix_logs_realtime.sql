-- Migration: Fix Logs & Realtime Stats
-- Description: Active le Realtime pour les logs et configure les politiques RLS nécessaires.

-- 1. Activer l'extension pour Realtime si nécessaire (géré par Supabase d'habitude)
-- En général, il faut ajouter les tables à la publication supabase_realtime.

-- Vérifier si la publication existe et ajouter les tables
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE download_logs;
        ALTER PUBLICATION supabase_realtime ADD TABLE system_logs;
    END IF;
EXCEPTION
    WHEN others THEN 
        -- Si la table est déjà dans la publication, l'erreur est ignorée
        NULL;
END $$;

-- 2. Configuration RLS pour download_logs
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permettre la lecture des logs de téléchargement" ON public.download_logs;
CREATE POLICY "Permettre la lecture des logs de téléchargement" 
ON public.download_logs FOR SELECT 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Permettre l'insertion anonyme de logs" ON public.download_logs;
CREATE POLICY "Permettre l'insertion anonyme de logs" 
ON public.download_logs FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 3. Configuration RLS pour system_logs
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permettre la lecture des logs système" ON public.system_logs;
CREATE POLICY "Permettre la lecture des logs système" 
ON public.system_logs FOR SELECT 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Permettre l'insertion de logs système" ON public.system_logs;
CREATE POLICY "Permettre l'insertion de logs système" 
ON public.system_logs FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 4. Assurer la présence des colonnes critiques (au cas où elles manqueraient)
ALTER TABLE public.system_logs ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.system_logs ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Grants
GRANT ALL ON public.download_logs TO anon, authenticated, service_role;
GRANT ALL ON public.system_logs TO anon, authenticated, service_role;
