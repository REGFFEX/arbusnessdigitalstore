-- Migration: Ajout du champ requires_license
-- Description: Indique si un produit est téléchargeable gratuitement mais nécessite une clé d'activation in-app.

ALTER TABLE public.products ADD COLUMN requires_license BOOLEAN DEFAULT false;
ALTER TABLE public.services ADD COLUMN requires_license BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.products.requires_license IS 'Si true, le produit gère ses propres licences/clés en interne après téléchargement.';
COMMENT ON COLUMN public.services.requires_license IS 'Si true, le service gère ses propres licences/clés en interne.';
