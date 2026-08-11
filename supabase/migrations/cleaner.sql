-- 1. Logs & Jeton de Téléchargement
DELETE FROM public.download_logs;
DELETE FROM public.download_tokens;

-- 2. Modules de Formation
DELETE FROM public.training_modules;

-- 3. Produits & Services
DELETE FROM public.products;
DELETE FROM public.services;

-- 4. Publicité & Marketing
DELETE FROM public.ads;

-- 5. Communauté & Branding (Optionnel - Décommentez pour nettoyer)
-- DELETE FROM public.community_posts;
-- DELETE FROM public.branding_messages;
-- DELETE FROM public.maintenance_history;

-- 6. Logs Système
DELETE FROM public.system_logs;

-- Note : Ces commandes suppriment TOUTES les données des tables concernées.
-- À exécuter dans l'éditeur SQL de Supabase.
