-- Migration: Création de la table center_posts (Améliorée avec Blocks & Groups)
-- Description: Centre multimédia AR Telegram - stockage de tous les types de publications

CREATE TABLE IF NOT EXISTS public.center_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'announcement'
    CHECK (type IN ('announcement','important','ad','video','audio','text','file','product_link','service_link','external_link','gallery')),
  title TEXT NOT NULL,
  content TEXT,
  media_urls JSONB DEFAULT '[]'::jsonb,
  thumbnail TEXT,
  linked_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  linked_service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  external_url TEXT,
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('critical','high','normal','low')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('published','draft','scheduled','archived','deleted')),
  source TEXT NOT NULL DEFAULT 'AR_BUSINESS',
  source_detail TEXT,
  admin_id UUID,
  card_size TEXT NOT NULL DEFAULT 'md'
    CHECK (card_size IN ('sm','md','lg')),
  pinned BOOLEAN DEFAULT false,
  share_count INTEGER DEFAULT 0,
  -- Groupement en blocs (Telegram-style)
  block_id TEXT,
  block_order INTEGER DEFAULT 0,
  -- Configuration de rendu (Lab ARDES)
  layout_config JSONB DEFAULT '{"width": "100%", "aspectRatio": "auto", "objectFit": "cover"}'::jsonb,
  scheduled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_center_posts_status ON public.center_posts(status);
CREATE INDEX IF NOT EXISTS idx_center_posts_type ON public.center_posts(type);
CREATE INDEX IF NOT EXISTS idx_center_posts_priority ON public.center_posts(priority);
CREATE INDEX IF NOT EXISTS idx_center_posts_created ON public.center_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_center_posts_pinned ON public.center_posts(pinned) WHERE pinned = true;
CREATE INDEX IF NOT EXISTS idx_center_posts_block ON public.center_posts(block_id);

-- RLS
ALTER TABLE public.center_posts ENABLE ROW LEVEL SECURITY;

-- Lecture publique (posts publiés uniquement)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'center_posts' 
        AND policyname = 'Public can read published center posts'
    ) THEN
        CREATE POLICY "Public can read published center posts"
        ON public.center_posts FOR SELECT
        USING (status = 'published' AND (deleted_at IS NULL));
    END IF;
END
$$;

-- Admins authentifiés : CRUD complet
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'center_posts' 
        AND policyname = 'Authenticated can manage center posts'
    ) THEN
        CREATE POLICY "Authenticated can manage center posts"
        ON public.center_posts FOR ALL
        USING (auth.role() = 'authenticated');
    END IF;
END
$$;

-- Réaltime (Handle existing)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'center_posts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.center_posts;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Publication might not exist yet or other issues, skip safely
        NULL;
END
$$;

COMMENT ON TABLE public.center_posts IS 'Centre multimédia AR Telegram - publications, pubs, vidéos, liens, fichiers';
