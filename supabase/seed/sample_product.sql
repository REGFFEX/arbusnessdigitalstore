-- PRODUIT DE TEST : Sample App Pro
-- Ce script insère un produit complet pour tester le flux de téléchargement et le système financier.
-- Correction : Utilisation de '{}' pour les colonnes TYPE ARRAY et '[]' pour JSONB.

INSERT INTO public.products (
    id, 
    name, 
    short_desc, 
    description, 
    type, 
    category, 
    sub_type, 
    os, 
    version, 
    size, 
    image, 
    image_path, 
    file_url, 
    file_path, 
    status, 
    is_premium, 
    monetization_type, 
    access_type, 
    price, 
    price_fcfa, 
    price_eur, 
    ads_video_count, 
    ads_video_price,
    display_config, 
    ranking_position,
    file_name_override,
    versions,
    contributors,
    roadmap,
    screenshots,
    tags,
    placements,
    active
) VALUES (
    gen_random_uuid(), 
    'Sample App Pro', 
    'Une application de test robuste pour AR Business.', 
    'Ceci est une description détaillée du produit de test. Il permet de vérifier que le prix en USD, FCFA et EUR s''affiche correctement, et que le fichier téléchargé conserve son extension .apk.', 
    'Application', 
    'Logiciel', 
    'Outil de Productivité', 
    'Android', 
    '1.2.5', 
    '24.8 MB', 
    'https://fxyidvshonjzkzihvmsy.supabase.co/storage/v1/object/public/images/branding/ar-business-logo-gold.png', 
    'branding/ar-business-logo-gold.png', 
    'https://fxyidvshonjzkzihvmsy.supabase.co/storage/v1/object/public/files/test_app_v1_FROM_ARB-DS.apk', 
    'files/test_app_v1_FROM_ARB-DS.apk', 
    'Stable', 
    true, 
    'paid', 
    'payant', 
    10.00, 
    6500, 
    9.50, 
    0, 
    0, 
    '{"show_usd": true, "show_fcfa": true, "show_eur": true}', 
    1,
    'my_test_application',
    '[]', -- versions (JSONB)
    '[{"name": "AR BUSINESS Team", "role": "Développeur"}]', -- contributors (JSONB)
    '[{"date": "2026-03-01", "label": "Lancement", "desc": "Ouverture officielle"}]', -- roadmap (JSONB)
    '{}', -- screenshots (ARRAY)
    '{"test", "pro"}', -- tags (ARRAY)
    '{"new", "trending"}', -- placements (ARRAY)
    true
);
