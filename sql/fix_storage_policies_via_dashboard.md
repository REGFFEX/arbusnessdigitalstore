# Guide — Configurer les politiques Storage dans le Dashboard Supabase

> **Corrigé avec les recommandations de Supabase AI**
> Les expressions utilisent `(SELECT auth.uid()) IS NOT NULL` (plus robuste que auth.role())

---

## Contexte

L'erreur `must be owner of table objects` survient car Supabase ne permet pas
de modifier les politiques RLS du Storage via SQL classique.
La seule solution est de les créer via l'interface Dashboard.

---

## Noms de buckets à configurer

- `images`
- `files`
- `branding` (pour le logo)

---

## Étape 1 — Accéder au Storage

1. Ouvre **https://app.supabase.com**
2. Sélectionne ton projet
3. Menu gauche → **Storage** → **Policies**
4. Clique sur le bucket → **"New Policy"**

---

## Expressions à coller par bucket

### 🪣 Bucket `images`

**1. SELECT — Lecture publique**
- Policy name : `images_public_read`
- Operation : `SELECT`
- Target roles : *(laisser vide)*
- USING :
```sql
true
```

**2. INSERT — Upload authentifiés**
- Policy name : `images_admin_insert`
- Operation : `INSERT`
- Target roles : `authenticated`
- WITH CHECK :
```sql
(SELECT auth.uid()) IS NOT NULL AND bucket_id = 'images'
```

**3. UPDATE — Mise à jour authentifiés**
- Policy name : `images_admin_update`
- Operation : `UPDATE`
- Target roles : `authenticated`
- USING :
```sql
(SELECT auth.uid()) IS NOT NULL AND bucket_id = 'images'
```

**4. DELETE — Suppression authentifiés**
- Policy name : `images_admin_delete`
- Operation : `DELETE`
- Target roles : `authenticated`
- USING :
```sql
(SELECT auth.uid()) IS NOT NULL AND bucket_id = 'images'
```

---

### 🪣 Bucket `files`

Mêmes 4 politiques — remplace partout `'images'` par `'files'` et `images_` par `files_` dans les noms.

**SELECT USING** : `true`

**INSERT WITH CHECK** :
```sql
(SELECT auth.uid()) IS NOT NULL AND bucket_id = 'files'
```

**UPDATE / DELETE USING** :
```sql
(SELECT auth.uid()) IS NOT NULL AND bucket_id = 'files'
```

---

### 🪣 Bucket `branding`

**SELECT USING** : `true`

**INSERT WITH CHECK** :
```sql
(SELECT auth.uid()) IS NOT NULL AND bucket_id = 'branding'
```

**UPDATE / DELETE USING** :
```sql
(SELECT auth.uid()) IS NOT NULL AND bucket_id = 'branding'
```

---

## Message prêt à copier pour l'IA Supabase

```
Je veux créer des politiques RLS pour mes buckets Storage Supabase.

Pour le bucket "images" :
1. SELECT public : USING (true)
2. INSERT authentifiés : WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND bucket_id = 'images')
3. UPDATE authentifiés : USING ((SELECT auth.uid()) IS NOT NULL AND bucket_id = 'images')
4. DELETE authentifiés : USING ((SELECT auth.uid()) IS NOT NULL AND bucket_id = 'images')

Fais la même chose pour les buckets "files" et "branding" en adaptant bucket_id.
```

---

## Test après configuration

1. ✅ Accès URL publique d'une image → doit fonctionner
2. ✅ Upload depuis l'admin connecté → doit fonctionner
3. ❌ Upload sans être connecté (mode anon) → doit échouer avec erreur 403
