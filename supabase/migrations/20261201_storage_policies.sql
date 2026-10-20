-- Migration: Storage Policies Configuration
-- Description: Configure les politiques de sécurité pour les buckets Storage Supabase
-- IMPORTANT: Les buckets doivent être créés manuellement via le Dashboard Supabase avant d'exécuter cette migration

-- ============================================================
-- PRÉREQUIS : Créer les buckets dans le Dashboard Supabase
-- ============================================================
-- 1. Bucket "files" : PRIVÉ (pas de lecture publique)
-- 2. Bucket "images" : PUBLIC EN LECTURE
--
-- Instructions Dashboard :
-- - Aller dans Storage → Create a new bucket
-- - Créer le bucket "files" avec "Public bucket" = OFF
-- - Créer le bucket "images" avec "Public bucket" = ON
-- ============================================================

-- ============================================================
-- BUCKET "FILES" - PRIVÉ
-- ============================================================

-- Activer RLS sur le bucket files (si désactivé)
DO $$
BEGIN
    -- Note: storage.buckets est une vue, pas une table réelle
    -- Les buckets sont gérés par le service Supabase Storage
    -- Cette migration configure uniquement les policies

    -- Supprimer les policies existantes pour éviter les doublons
    DROP POLICY IF EXISTS "Files: Public Read" ON storage.objects;
    DROP POLICY IF EXISTS "Files: Authenticated Upload" ON storage.objects;
    DROP POLICY IF EXISTS "Files: Authenticated Update" ON storage.objects;
    DROP POLICY IF EXISTS "Files: Service Role Delete" ON storage.objects;
    DROP POLICY IF EXISTS "Files: Authenticated Read Own" ON storage.objects;

    RAISE NOTICE 'Old policies dropped for files bucket';
END $$;

-- Policy: Interdire la lecture publique sur files
CREATE POLICY "Files: Public Read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
    bucket_id = 'files'
    AND false -- Pas de lecture publique
);

-- Policy: Upload réservé aux authenticated pour files
CREATE POLICY "Files: Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'files'
    AND auth.role() = 'authenticated'
);

-- Policy: Update réservé aux authenticated pour files
CREATE POLICY "Files: Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'files'
    AND auth.role() = 'authenticated'
);

-- Policy: Delete réservé à service_role pour files
CREATE POLICY "Files: Service Role Delete"
ON storage.objects FOR DELETE
TO service_role
USING (
    bucket_id = 'files'
);

-- ============================================================
-- BUCKET "IMAGES" - PUBLIC EN LECTURE
-- ============================================================

-- Supprimer les policies existantes pour éviter les doublons
DO $$
BEGIN
    DROP POLICY IF EXISTS "Images: Public Read" ON storage.objects;
    DROP POLICY IF EXISTS "Images: Authenticated Upload" ON storage.objects;
    DROP POLICY IF EXISTS "Images: Authenticated Update" ON storage.objects;
    DROP POLICY IF EXISTS "Images: Service Role Delete" ON storage.objects;

    RAISE NOTICE 'Old policies dropped for images bucket';
END $$;

-- Policy: Lecture publique autorisée sur images
CREATE POLICY "Images: Public Read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
    bucket_id = 'images'
);

-- Policy: Upload réservé aux authenticated pour images
CREATE POLICY "Images: Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
);

-- Policy: Update réservé aux authenticated pour images
CREATE POLICY "Images: Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
);

-- Policy: Delete réservé à service_role pour images
CREATE POLICY "Images: Service Role Delete"
ON storage.objects FOR DELETE
TO service_role
USING (
    bucket_id = 'images'
);

-- ============================================================
-- GRANTS
-- ============================================================

-- S'assurer que les rôles ont les permissions de base sur storage
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon, authenticated, service_role;

COMMENT ON POLICY "Files: Public Read" ON storage.objects IS 'Interdit la lecture publique sur le bucket files (toujours false)';
COMMENT ON POLICY "Files: Authenticated Upload" ON storage.objects IS 'Autorise l''upload pour les utilisateurs authentifiés sur le bucket files';
COMMENT ON POLICY "Files: Authenticated Update" ON storage.objects IS 'Autorise la mise à jour pour les utilisateurs authentifiés sur le bucket files';
COMMENT ON POLICY "Files: Service Role Delete" ON storage.objects IS 'Autorise la suppression par service_role sur le bucket files';
COMMENT ON POLICY "Images: Public Read" ON storage.objects IS 'Autorise la lecture publique sur le bucket images';
COMMENT ON POLICY "Images: Authenticated Upload" ON storage.objects IS 'Autorise l''upload pour les utilisateurs authentifiés sur le bucket images';
COMMENT ON POLICY "Images: Authenticated Update" ON storage.objects IS 'Autorise la mise à jour pour les utilisateurs authentifiés sur le bucket images';
COMMENT ON POLICY "Images: Service Role Delete" ON storage.objects IS 'Autorise la suppression par service_role sur le bucket images';
