# 📋 Scripts SQL à Exécuter dans Supabase

## 1️⃣ Script pour créer la table `services`

Copiez et exécutez ce script dans **Supabase SQL Editor** :

```sql
-- Créer la table services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  image TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS (Row Level Security)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Politique : Lecture publique pour services actifs
CREATE POLICY "Public read active services"
  ON services
  FOR SELECT
  USING (active = true);

-- Politique : Admin peut tout faire
CREATE POLICY "Admin full access services"
  ON services
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE id = auth.uid()::uuid
    )
  );

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at DESC);

-- Commentaires
COMMENT ON TABLE services IS 'Table des services digitaux proposés par AR Business';
COMMENT ON COLUMN services.name IS 'Nom du service';
COMMENT ON COLUMN services.description IS 'Description détaillée du service';
COMMENT ON COLUMN services.type IS 'Type de service (consulting, development, support, etc.)';
COMMENT ON COLUMN services.image IS 'URL de l''image du service';
COMMENT ON COLUMN services.active IS 'Service actif/visible sur le site';
```

---

## 2️⃣ Configuration Admin - Créer votre compte admin

### Étape 1 : Créer un compte utilisateur dans Supabase Auth

Allez dans **Supabase Dashboard → Authentication → Users** et cliquez sur **"Add user"** (ou connectez-vous via `/admin/login` si vous avez déjà un compte).

**Notez l'UUID de votre utilisateur** (exemple: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Étape 2 : Ajouter votre UUID dans la table `admins`

Exécutez ce script dans **Supabase SQL Editor** en remplaçant `VOTRE_UUID_ICI` par l'UUID de votre compte :

```sql
-- Insérer votre compte comme admin
INSERT INTO admins (id, external_id)
VALUES (
  'VOTRE_UUID_ICI'::uuid,  -- Remplacez par votre UUID depuis auth.users
  NULL
)
ON CONFLICT (id) DO NOTHING;
```

**Exemple concret :**
```sql
INSERT INTO admins (id, external_id)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NULL
)
ON CONFLICT (id) DO NOTHING;
```

### Étape 3 : Vérifier que ça fonctionne

```sql
-- Vérifier que votre compte est bien admin
SELECT * FROM admins;
```

Vous devriez voir votre UUID dans la liste.

---

## 3️⃣ Comment accéder à l'admin

1. **Connectez-vous** : Allez sur `http://localhost:5173/admin/login`
2. **Entrez vos identifiants** Supabase (email + mot de passe)
3. **Vous serez redirigé** vers `/admin` si vous êtes dans la table `admins`

---

## 📝 Résumé

**Pour créer un admin :**
1. Créer un compte dans Supabase Auth (ou se connecter)
2. Copier l'UUID du compte depuis `Authentication → Users`
3. Exécuter : `INSERT INTO admins (id) VALUES ('VOTRE_UUID'::uuid);`
4. Se connecter sur `/admin/login`

**Tables importantes :**
- `auth.users` → Tous les utilisateurs Supabase
- `admins` → Liste des UUIDs autorisés à accéder à l'admin

---

## 🔒 Sécurité

Le système utilise **Row Level Security (RLS)** :
- Les utilisateurs publics peuvent seulement **lire** les services actifs
- Les admins (présents dans la table `admins`) ont **accès complet**
- Votre UUID doit être dans la table `admins` pour accéder à `/admin`
