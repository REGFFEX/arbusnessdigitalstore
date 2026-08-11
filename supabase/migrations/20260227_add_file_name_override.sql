-- Migration: Add file_name_override to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS file_name_override TEXT;

COMMENT ON COLUMN public.products.file_name_override IS 'Nom du fichier personnalisé fourni par l''admin pour l''upload.';
