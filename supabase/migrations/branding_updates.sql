-- Migration: Add Branding Features
CREATE TABLE IF NOT EXISTS public.branding_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS branding_name TEXT DEFAULT 'AR BUSINESS DIGITAL STORE',
ADD COLUMN IF NOT EXISTS branding_description TEXT DEFAULT 'Pôle de AR BUSINESS spécialisé dans la distribution et la vente de produits et services digitaux.',
ADD COLUMN IF NOT EXISTS branding_location TEXT DEFAULT 'Afrique, Congo-Brazzaville, Académie Militaire Marien NGOUABI',
ADD COLUMN IF NOT EXISTS branding_autoscroll BOOLEAN DEFAULT true;

-- Basic initial values if current doesn't exist
INSERT INTO public.site_settings (id, branding_name) 
VALUES ('current', 'AR BUSINESS DIGITAL STORE')
ON CONFLICT (id) DO NOTHING;
