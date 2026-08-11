# RAPPORT TECHNIQUE DE DIAGNOSTIC POUR SUPABASE AI

## Contexte du Projet
- **Nom sur Supabase** : AR BUSINESS DIGITAL STORE
- **Stack** : Vite (React) + Supabase (Auth/DB/Storage) + Prisma.
- **Utilisateur Maître (Master Admin)** : `ahrafalnazar@gmail.com`

## Le Problème Critique
Erreur persistante : `new row violates row-level security policy` lors de l'insertion de lignes dans les tables `public.products` et `public.services` depuis le dashboard d'administration.

### Le Paradoxe "Intersidéral"
L'erreur persiste même après avoir exécuté :
```sql
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
```
Techniquement, si RLS est désactivé, cette erreur ne devrait plus exister pour ces tables.

## Hypothèses de Diagnostic (À vérifier par l'IA Supabase)

### 1. Le Stockage (Storage.objects)
L'application uploade une image de couverture et un fichier (APK/EXE) **AVANT** d'insérer le produit dans la table SQL. 
- **L'erreur `new row violates row-level security policy` pourrait provenir de la table `storage.objects`** du schéma `storage`.
- Si le bucket `images` ou `files` est en mode "Private" sans politiques RLS appropriées pour l'upload, l'action échoue.

### 2. Désynchronisation des IDs (Auth.uid vs Public.admins)
Il y a eu des soupçons de désynchronisation entre l'UUID de `auth.users` et celui de la table `public.admins`.
- Est-ce que les triggers ou les politiques RLS (quand actives) utilisent une jointure qui échoue si l'ID n'est pas strictement identique ?

### 3. Schéma et Triggers
Y a-t-il des triggers `BEFORE INSERT` ou `AFTER INSERT` sur la table `products` qui tentent d'écrire dans une autre table (ex: `system_logs`) où RLS serait encore actif et restrictif ?

## Structure Actuelle (Extraite via Prisma)
- **Table `admins`** : `id` (UUID), `email`, `role` (master/admin), `status` (active/pending/blocked).
- **Table `products`** : `id` (UUID), `name`, `screenshots` (TEXT[]), `file_url`, `file_path`, etc.
- **Table `site_settings`** : `id` (TEXT, PK: 'current'), `logo_url`.

## Historique des tentatives échouées
1. **Politiques standards** basées sur `auth.jwt()`.
2. **Fonctions de sécurité** (`SECURITY DEFINER`) pour éviter la récursion.
3. **Synchronisation forcée** des IDs par script SQL.
4. **Désactivation totale de RLS** sur le schéma public.

## Question précise pour l'IA Supabase
"Pourquoi reçois-je une `new row violates row-level security policy` lors d'un `INSERT` dans une table du schéma `public` alors que RLS est explicitement `DISABLED` sur cette table ? Est-ce que cela peut provenir d'un échec d'upload dans `storage.objects` ou d'un trigger sur une table liée ? Peux-tu inspecter les erreurs récentes dans les logs `Postgres` ou `Storage` pour identifier la table exacte qui rejette l'insertion ?"
