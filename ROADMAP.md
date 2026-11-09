# AR Business Digital Store — Feuille de route

Document de suivi unique. Toute demande produit est classée ici avant exécution.
Dernière vérification technique : 9 novembre 2026.

## État vérifié aujourd'hui

| Bloc | Contenu | Statut |
| --- | --- | --- |
| Bloc 1 | Refonte design (shell modulaire, sidebar, nav flottante, anti-débordement) | ✅ Terminé |
| Bloc 1bis | Centre d'informations multi-sources (Organisation / Produit / Système) + signature ECDSA | ✅ Terminé |
| Bloc 1ter | Corrections requêtes Supabase (406 `site_settings`, 404 table `settings`) | ✅ Terminé |
| **Bloc 2** | **Base de données & accès admin/super admin** | ⏳ **En cours — priorité absolue** |
| Bloc 3 | Modes d'affichage Liste / Compact / Grille | ⬜ À faire |
| Bloc 4 | Organisation hiérarchique des données par module | ⬜ À faire |
| Bloc 5 | Mises à jour dépendances / packaging | ⬜ À faire |

## Bloc 2 — Base de données & accès admin (prioritaire)

### Ce qui est vérifié côté Supabase (projet `wgxhfchfkaftihubaptt`)

- **Tables applicatives présentes** : `admins`, `ads`, `categories`, `download_logs`, `products`,
  `training_modules`, `system_logs`, `services`, `site_settings`, `community_posts`,
  `payment_settings`, `training_progress`, `ardes_system_state`, `download_tokens`,
  `subtypes`, `branding_messages`, `center_posts`.
- **Tables absentes mais non utilisées par le code** (aucune requête dans `src/`) :
  `profiles`, `orders`, `product_versions`, `site_content`, `settings` (legacy, remplacée par
  `site_settings.site_content`). → rien à reconstruire de ce côté.
- **Contenu** : `products` = 0 ligne, `admins` = 0 ligne. La boutique est vide.
- **Connexion** : l'endpoint `auth/v1/token` répond correctement (400 « Invalid login
  credentials » pour de mauvais identifiants, message affiché proprement par la page de
  connexion). Le problème restant n'est pas le réseau mais l'absence de **compte admin**
  dans Supabase Auth et de **ligne correspondante dans `admins`**.

### Étapes de déblocage

1. Créer le compte super admin dans Supabase Auth (email + mot de passe, email confirmé).
2. Insérer la ligne `admins` correspondante (`role = master`, `status = active`).
3. Créer la ligne singleton `site_settings` (`id = current`) avec les valeurs par défaut.
4. Vérifier les politiques RLS (lecture publique du catalogue, écriture authentifiée).
5. Charger un jeu de données initial : catégories, sous-types, produits.

Les étapes 1 à 3 sont exécutées par l'agent dès que la clé `SUPABASE_SERVICE_ROLE_KEY` est
fournie (les écritures d'authentification exigent cette clé ; la clé `anon` ne le permet pas).

## Bloc 3 — Modes d'affichage

Liste / Compact / Grille sur les pages catalogue, persistés par module et par utilisateur.

## Bloc 4 — Organisation hiérarchique

Arborescence catégories → sous-types → produits, appliquée à tous les modules de données.

## Bloc 5 — Maintenance technique

Mise à jour maîtrisée des dépendances, build de production, vérification du bundle.

## Règles de travail retenues

- Une seule source de vérité de configuration : `site_settings` (+ `site_content` en JSON).
- Chaque information affichée porte son badge de source (Organisation / Produit / Système).
- Un aperçu des modifications est fourni avant toute importation de données.
