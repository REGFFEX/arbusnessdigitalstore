-- Migration pour enrichir les paramètres de paiement
ALTER TABLE public.payment_settings 
ADD COLUMN IF NOT EXISTS payment_instruction text DEFAULT 'Redirection vers la plateforme sécurisée de paiement.',
ADD COLUMN IF NOT EXISTS mtn_checkout_url text,
ADD COLUMN IF NOT EXISTS airtel_checkout_url text,
ADD COLUMN IF NOT EXISTS orange_checkout_url text;

-- Commentaire pour l'admin
COMMENT ON COLUMN public.payment_settings.payment_instruction IS 'Texte d''instruction affiché avant la redirection de paiement.';
COMMENT ON COLUMN public.payment_settings.mtn_checkout_url IS 'URL personnalisée pour le checkout MTN.';
COMMENT ON COLUMN public.payment_settings.airtel_checkout_url IS 'URL personnalisée pour le checkout Airtel.';
COMMENT ON COLUMN public.payment_settings.orange_checkout_url IS 'URL personnalisée pour le checkout Orange.';
