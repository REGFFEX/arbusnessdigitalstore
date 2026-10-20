# PHASE 2 - Configuration Storage Supabase

## ÉTAPE 1 : Créer les buckets via Dashboard Supabase

Aller dans le Dashboard Supabase → Storage → Create a new bucket

### Bucket "files"
- **Nom** : `files`
- **Public bucket** : OFF (décocher "Make bucket public")
- **File size limit** : 50MB (recommandé)
- **Allowed MIME types** : Tous (ou restreindre selon besoins)

### Bucket "images"
- **Nom** : `images`
- **Public bucket** : ON (cocher "Make bucket public")
- **File size limit** : 10MB (recommandé)
- **Allowed MIME types** : `image/*`

## ÉTAPE 2 : Appliquer la migration SQL

Exécuter la migration suivante dans l'éditeur SQL du Dashboard Supabase :

```bash
# Via CLI Supabase
supabase db push --include-storage
```

Ou copier-coller le contenu de `supabase/migrations/20261201_storage_policies.sql` dans l'éditeur SQL du Dashboard.

## ÉTAPE 3 : Vérification

### Vérifier les buckets
Dans Dashboard → Storage :
- ✅ Bucket "files" existe avec "Public bucket" = OFF
- ✅ Bucket "images" existe avec "Public bucket" = ON

### Vérifier les policies
Dans Dashboard → Storage → Policies :
- ✅ Files: Public Read (toujours false)
- ✅ Files: Authenticated Upload
- ✅ Files: Authenticated Update
- ✅ Files: Service Role Delete
- ✅ Images: Public Read
- ✅ Images: Authenticated Upload
- ✅ Images: Authenticated Update
- ✅ Images: Service Role Delete

## ÉTAPE 4 : Test de fonctionnement

### Test 1 : Upload images (doit fonctionner)
- Connecté en tant qu'admin
- Ajouter un produit avec une image
- ✅ Upload doit réussir

### Test 2 : Lecture images (doit fonctionner)
- Visiter la page publique du store
- ✅ Les images doivent s'afficher

### Test 3 : Upload files (doit fonctionner)
- Connecté en tant qu'admin
- Ajouter un produit avec un fichier
- ✅ Upload doit réussir

### Test 4 : Téléchargement files (doit fonctionner via signed URL)
- Tenter de télécharger un produit
- ✅ Le téléchargement doit passer par `SecureDownload.tsx` avec signed URL
- ❌ L'accès direct via `getPublicUrl('files', path)` doit échouer

## CHEMINS UTILISÉS PAR LE CODE

### Bucket "files"
- `applications/` - Fichiers APK
- `logiciels/` - Fichiers exécutables
- `jeux/` - Fichiers jeux
- `formations/` - Modules de formation
- `versions/` - Versions multi-plateformes
- `modules/` - Modules de formation
- `center/{postId}/` - Médias center posts

### Bucket "images"
- `avatars/` - Avatars admins
- `qrcodes/` - QR codes admins/partners
- `screenshots/` - Screenshots produits
- `covers/` - Images couverture produits
- `ads/` - Médias publicités
- `community/` - Images posts communauté
- `branding/` - Logos personnalisés
- `partners_qr/` - QR codes partenaires
- `services/` - Images services
- `contributors/` - Photos contributeurs

## REMARQUES IMPORTANTES

1. **Aucun fichier frontend modifié** - Le code existant continue de fonctionner
2. **Signed URLs** - Le système `downloads.ts` utilise déjà `createSignedUrl()` qui fonctionne avec les policies
3. **getPublicUrl()** - Pour le bucket "files", cette fonction retournera une URL mais l'accès sera bloqué par la policy
4. **Compatibilité** - Les uploads existants dans `admin.ts`, `AddProduct.tsx`, etc. ne sont pas affectés
