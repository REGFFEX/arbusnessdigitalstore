-- Ajout de la colonne edition à la table products
ALTER TABLE products ADD COLUMN IF NOT EXISTS edition TEXT;

-- Index pour la recherche par édition
CREATE INDEX IF NOT EXISTS idx_products_edition ON products(edition);

COMMENT ON COLUMN products.edition IS 'Label d''édition du produit (ex: Office 2026, Edition Annuelle, etc.)';
