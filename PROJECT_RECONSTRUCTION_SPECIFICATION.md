# AR Business Digital Store — état technique et base de reconstruction

> Relevé du dépôt local au 19 octobre 2026. Ce document décrit les fichiers et
> le code observés dans l'arbre de travail; il ne certifie pas l'état du projet
> Supabase hébergé ni la présence effective des données en production.

## 1. Résumé exécutif

Le projet actuel est une application web monopage (SPA) React 19, TypeScript,
Vite et Tailwind. Le navigateur dialogue directement avec Supabase pour
l'authentification, les requêtes PostgreSQL et les transferts Supabase Storage.
Le dépôt contient aussi un schéma Prisma PostgreSQL, un seed Prisma et une
fonction serverless Netlify, mais ces éléments ne forment pas un backend
cohérent et interchangeable avec l'accès Supabase du frontend.

La base applicative principalement visée est PostgreSQL/Supabase. Les
spécifications client et admin existantes décrivent des fonctionnalités
produit, mais ne constituent ni un schéma d'initialisation complet de la base,
ni un mécanisme de sauvegarde/restauration des données.

### Stack repérée

- **Interface** : React 19, TypeScript, React Router 7.
- **Build / développement** : Vite 8; sortie de production dans `dist/`.
- **Styles** : Tailwind CSS 3, PostCSS, styles dans `src/styles/tailwind.css`.
- **Données et identité** : Supabase JS 2 (PostgreSQL, Auth, Storage et
  fonctions RPC).
- **ORM parallèle** : Prisma 7 avec `prisma/schema.prisma`, sans dossier de
  migrations Prisma présent dans l'arbre courant.
- **Déploiement configuré** : fichiers de réécriture SPA Netlify et Vercel;
  une seule fonction Netlify (`log-download.js`).
- **Pas de script de test** dans `package.json`; aucun service HTTP/API
  applicatif classique n'a été repéré.

## 2. Inventaire du dépôt courant

### Racine et configuration

```text
.
├── .env                         # présent localement; ne pas copier ni publier
├── .env.example
├── package.json / package-lock.json
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.cjs
├── postcss.config.cjs
├── netlify.toml
├── vercel.json
├── prisma.config.ts
├── README.md
├── ADMIN_TECHNICAL_SPECIFICATION.md
├── CLIENT_TECHNICAL_SPECIFICATION.md
├── SETUP_ADMIN.md
├── SUPABASE_AI_DIAGNOSTIC.md
├── check_projects.ts
├── check_tables.mjs
├── diagnostic_auth.js
├── merge_sql.js
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── netlify/
│   └── functions/log-download.js
├── sql/
│   ├── PHASE2_STORAGE_SETUP.md
│   └── fix_storage_policies_via_dashboard.md
├── supabase/
│   ├── migrations/              # migrations SQL incrémentales, pas de baseline
│   └── seed/sample_product.sql
├── public/
│   ├── favicon.ico
│   ├── logo.png
│   └── manifest.json
├── src/
├── logoarbds/
└── Cahier de chargii/           # documents de conception métier
```

Autres fichiers non listés dans l'arborescence applicative :
`src/mes amelioration à moi.txt`, ainsi que `Cahier de chargii/CC.txt`, `CCF.txt`,
`CCT.txt`, `CCUIUX.txt`, `MERISE.txt`, `inspiration des similaires Site.txt`
et `pub moderne.txt`.

Les dossiers `.git`, `.vs`, `.vscode`, `.qodo`, `node_modules` et `dist` sont
également présents localement. `node_modules` et `dist` sont des dépendances
installées et des sorties générées, pas des sources à reprendre comme données
de projet.

### Arborescence applicative `src/`

```text
src/
├── app/App.tsx
├── main.tsx
├── vite-env.d.ts
├── vercel.json
├── styles/tailwind.css
├── types/database.ts
├── config/
│   ├── ardes_config.ts
│   ├── categories.ts
│   └── supabase.ts
├── context/
│   ├── AdsContext.tsx
│   ├── ARDESContext.tsx
│   ├── BrandingContext.tsx
│   └── ThemeContext.tsx
├── hooks/
│   ├── useAuth.tsx
│   ├── useFormPersistence.ts
│   └── useSettings.tsx
├── services/
│   ├── PaymentService.ts
│   ├── admin.ts
│   ├── ai.ts
│   ├── center.ts
│   ├── community.ts
│   ├── downloads.ts
│   ├── exportService.ts
│   ├── prismaProducts.ts
│   ├── products.ts
│   └── servicesApi.ts
├── utils/
│   ├── archiveUtils.ts
│   ├── currency.ts
│   ├── currency_converter.ts
│   ├── prismaClient.ts
│   └── wishlist.ts
├── components/
│   ├── AI/AIAgentSystem.tsx
│   ├── Center/
│   │   ├── CenterCard.tsx
│   │   ├── CenterFilters.tsx
│   │   ├── CenterMediaViewer.tsx
│   │   ├── HorizontalShelf.tsx
│   │   └── ShareMenu.tsx
│   ├── AdInterstitial.tsx
│   ├── AdsPlayer.tsx
│   ├── AdVideoOverlay.tsx
│   ├── AdWall.tsx
│   ├── AnnouncementRibbon.tsx
│   ├── ARDES.tsx
│   ├── Badge.tsx
│   ├── BrandingInfoBlock.tsx
│   ├── ComingSoonCard.tsx
│   ├── ErrorBoundary.tsx
│   ├── Footer.tsx
│   ├── FormNavigator.tsx
│   ├── Hero.tsx
│   ├── HorizontalShelf.tsx
│   ├── Icons.tsx
│   ├── Loader.tsx
│   ├── MobileRibbon.tsx
│   ├── Navbar.tsx
│   ├── PaymentModal.tsx
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── ProtectedRoute.tsx
│   ├── ScrollToTop.tsx
│   ├── ServiceCard.tsx
│   ├── SiteNav.tsx
│   ├── Skeleton.tsx
│   ├── SmartSearch.tsx
│   ├── StoreBanner.tsx
│   ├── StoreSearch.tsx
│   └── StoreSections.tsx
├── pages/
│   ├── About.tsx
│   ├── ARCenter.tsx
│   ├── Categories.tsx
│   ├── ComingSoon.tsx
│   ├── Community.tsx
│   ├── Guide.tsx
│   ├── Home.tsx
│   ├── Maintenance.tsx
│   ├── Premium.tsx
│   ├── Product.tsx
│   ├── ProjectRoadmap.tsx
│   ├── Search.tsx
│   ├── SecureDownload.tsx
│   ├── ServiceDetail.tsx
│   ├── Services.tsx
│   ├── Store.tsx
│   └── Admin/
│       ├── AddProduct.tsx
│       ├── AddService.tsx
│       ├── AdminArchives.tsx
│       ├── AdminOverview.tsx
│       ├── ArdesLab.tsx
│       ├── Dashboard.tsx
│       ├── DataStats.tsx
│       ├── Login.tsx
│       ├── ManageAdmins.tsx
│       ├── ManageAds.tsx
│       ├── ManageCategories.tsx
│       ├── ManageCenter.tsx
│       ├── ManageCommunity.tsx
│       ├── ManagePremium.tsx
│       ├── ManageProducts.tsx
│       ├── ManageProjects.tsx
│       ├── ManageServices.tsx
│       ├── Settings.tsx
│       └── VisualManagement.tsx
└── assets/
    ├── logos/
    ├── outils/
    │   ├── application/
    │   ├── audio/
    │   ├── documents/
    │   ├── image/
    │   │   ├── backgrounds/
    │   │   ├── icons/
    │   │   ├── logos/
    │   │   ├── publicities/
    │   │   ├── themes/
    │   │   └── userimages/
    │   ├── liens/
    │   ├── logiciels/
    │   └── video/
    ├── platforms/
    ├── systems/
    └── team/
```

Les fichiers binaires des répertoires d'assets n'ont pas été énumérés
individuellement. Certains logiciels et APK sont empaquetés dans `src/assets`;
les fichiers volumineux ne doivent pas être confondus avec les enregistrements
de la base ou les objets Supabase Storage.

### État Git à prendre en compte

L'arbre de travail n'est pas propre. Parmi les différences constatées :

- les spécifications client/admin, `.env.example`, `package.json`, plusieurs
  fichiers frontend et configs sont modifiés;
- `src/context/ThemeContext.tsx`, `sql/PHASE2_STORAGE_SETUP.md` et
  `supabase/migrations/20261201_storage_policies.sql` sont non suivis;
- `supabase/.temp/` est également non suivi et correspond à des fichiers
  temporaires locaux, pas à une migration de données;
- `src-tauri/` et `arbusinessstoreii.rar` sont supprimés dans l'arbre de
  travail, bien qu'ils figurent encore dans Git;
- les scripts desktop Tauri ont été retirés de `package.json`.

Il faut donc décider explicitement si la reconstruction reprend ces
changements locaux ou la dernière version commitée. Le dépôt courant est
web-first; il ne contient plus les sources Tauri dans son état de travail.

## 3. Fonctionnalités et rôles constatés

### Parcours client/public

Routes déclarées dans `src/app/App.tsx` :

`/`, `/store`, `/product/:id`, `/categories`, `/premium`, `/services`,
`/services/:id`, `/about`, `/search`, `/roadmap`, `/coming-soon`,
`/community`, `/guide`, `/secure-download`, `/ar-center`.

Le catalogue, les services, les annonces, les publications et les paramètres
du site sont lus via Supabase. La wishlist, l'historique de recherche, la
préférence de thème, les conversations IA, le niveau premium et certains
déblocages sont enregistrés dans `localStorage`; ces données sont locales au
navigateur et ne suivent ni un compte ni un changement d'appareil.

Il n'y a pas de modèle de profil client ou de table de commande/achat dans le
schéma Prisma inspecté. L'authentification constatée concerne les
administrateurs. Les comptes client, la bibliothèque d'achats, les points de
fidélité et les avis/questions mentionnés comme évolutions dans la
spécification client ne sont donc pas établis comme fonctionnalités backend
persistées.

### Parcours admin

- Connexion par Supabase Auth (`signInWithPassword`).
- Le profil d'autorisation est recherché dans `public.admins`, avec
  `admins.id` égal à l'identifiant de l'utilisateur Auth.
- Les rôles décrits par le code sont `master` et `admin`; les statuts sont
  `active`, `pending` et `blocked`.
- Les routes admin sont regroupées sous le chemin configuré par
  `ARDES_CONFIG.ADMIN_PATH` (actuellement `ardes-gate-88`) et enveloppées par
  `ProtectedRoute`; le chemin obscurci ne remplace pas l'authentification,
  les contrôles serveur ou les politiques RLS.
- Le dashboard couvre produits, services, admins, catégories, annonces,
  projets, communautés, ARDES, statistiques, archives et paramètres.
- Le code admin utilise directement le client Supabase dans le navigateur;
  l'interface ne constitue donc pas à elle seule une frontière de sécurité.

## 3A. Inventaire fonctionnel complet des modules visibles

Cet inventaire recense les routes enregistrées dans `src/app/App.tsx` et les
écrans Admin présents sous `src/pages/Admin/`. Il décrit les responsabilités
et fonctions visibles dans le code ou les spécifications existantes; il ne
signifie pas que chaque intégration tierce ou scénario métier est connecté à
un service de production.

### Modules client/public

| Module / route | Fonctionnalités et données associées |
|---|---|
| Accueil `/` — `Home` | Présentation/hero, accès rapides, catégories et sections de produits/services. Les contenus et sections peuvent dépendre des réglages du site. |
| Store `/store` — `Store` | Catalogue produits, cartes/grilles, sections de produits et accès aux filtres/recherche. |
| Détail produit `/product/:id` — `Product` | Fiche produit, prix et type d'accès, variantes/OS, liens de téléchargement, médias, produits associés et wishlist. Le niveau Premium et certains déblocages sont locaux au navigateur. |
| Catégories `/categories` — `Categories` | Navigation taxonomique et filtrage par catégorie/sous-type de produits et services. |
| Recherche `/search` — `Search` | Page de résultats ouverte depuis les recherches globale ou store; les critères peuvent être passés par URL. |
| Premium `/premium` — `Premium` | Présentation des niveaux/configurations premium et actions d'accès. Dans le code constaté, le niveau local n'est pas un paiement confirmé côté serveur. |
| Services `/services` — `Services` | Catalogue de prestations B2B/formations; données depuis `services`. |
| Détail de service `/services/:id` — `ServiceDetail` | Description détaillée, fonctionnalités, informations de projet et liens de contact externes selon l'offre. |
| Roadmap `/roadmap` — `ProjectRoadmap` | Vue des projets/roadmaps de produits et services, phases et dates prévues. |
| Communauté `/community` — `Community` | Fil d'actualités/annonces depuis `community_posts`, avec média et liens externes. |
| Centre AR `/ar-center` — `ARCenter` | Consultation du centre multimédia; publications depuis `center_posts`, filtre/type, cartes et médias. |
| Téléchargement sécurisé `/secure-download` — `SecureDownload` | Parcours de validation d'un jeton et téléchargement de fichier via Supabase Storage. La sécurité effective dépend aussi des policies/contrôles RLS déployés. |
| Guide `/guide` — `Guide` | Aide et explications d'utilisation du store. |
| À propos `/about` — `About` | Présentation institutionnelle/branding. |
| À venir `/coming-soon` — `ComingSoon` | Présentation des éléments non encore disponibles ou en préparation. |
| Maintenance `/` (mode global) — `Maintenance` | Écran de maintenance quand `site_settings.maintenance_mode` est actif; le chemin admin est exempté de ce rendu. |

### Modules du back-office

| Écran / route admin | Responsabilité principale observée |
|---|---|
| Connexion `/ardes-gate-88/login` et ancien `/admin/login` — `Login` | Connexion Supabase Auth; redirection vers le tableau admin. Le chemin configuré n'est pas une mesure de sécurité suffisante à lui seul. |
| Coquille dashboard — `Dashboard` | Barre de navigation admin responsive, profil/role affiché, historique d'actions, Push Updates, lien retour au store, déconnexion et assistant IA flottant. |
| Vue d'ensemble `/ardes-gate-88` — `AdminOverview` | KPIs et raccourcis vers les opérations de contenu et statistiques. |
| Ajouter un produit `/add` — `AddProduct` | Création et chargement d'une fiche produit, champs de taxonomie, prix/monétisation, supports et versions; gestion possible de modules de formation et médias/fichiers. |
| Produits `/manage` — `ManageProducts` | Consultation, recherche/filtrage, modification et suppression du catalogue, états/placements et opérations de mise en avant. |
| Projets `/projects` — `ManageProjects` | Filtrage et mise à jour du statut/phase de projets liés aux produits et services. |
| Ajouter un service `/add-service` — `AddService` | Création d'une prestation, description, catégorie, contacts, projet/roadmap et données de monétisation. |
| Services `/services` — `ManageServices` | Gestion des offres et de leur publication/état. |
| Publicités `/ads` — `ManageAds` | Gestion des médias publicitaires, activation, priorité, placement/revenu et liens cibles ou produits. |
| Communauté `/manage-community` — `ManageCommunity` | Création et gestion du flux `community_posts`, médias, statut/épingle et détails d'affichage. |
| Centre AR `/center` — `ManageCenter` | Création/édition, planification, priorité, publication, suppression/restauration, regroupement, ordre et médias des publications `center_posts`. |
| Catégories `/categories` — `ManageCategories` | Gestion des catégories et sous-types utilisés par le catalogue. |
| Administrateurs `/users` — `ManageAdmins` | Gestion de profils admin, statut/role et permissions; route présentée dans le dashboard uniquement pour `master`. |
| AR-DES `/ardes` — `ArdesLab` | Espace/laboratoire ARDES et outils de simulation/design décrits par la spécification admin; certaines données de workspace sont locales. |
| Données & stats `/stats` — `DataStats` | Statistiques et consultations de `download_logs` / `system_logs`; les métriques disponibles dépendent du schéma distant et des droits. |
| Archives `/archives` — `AdminArchives` | Consultation et export de journaux/contenus en TXT, XLSX, PDF, DOCX ou ZIP; export local, pas restauration DB. |
| Profil & sécurité `/settings` — `Settings` | Informations de profil/compte et réglages admin décrits par le panneau. |
| Premium `/premium` — `ManagePremium` | Édition de la configuration premium stockée par le frontend dans `settings`; définition/table absente du schéma Prisma repéré. |
| Gestion visuelle `/visual` — `VisualManagement` | Outils de configuration visuelle/identité et affichage. Ne pas confondre le libellé « Importer » de l'interface avec un import général de base de données : aucun restore DB n'a été repéré. |

### Services applicatifs/backend côté code

Il n'existe pas de backend métier monolithique avec contrôleurs REST dédiés.
Les responsabilités serveur sont distribuées entre les services frontend
`src/services/`, Supabase et une fonction serverless :

| Service | Rôle constaté |
|---|---|
| `products.ts` | Lectures du catalogue, filtrage, recherche, catégories, popularité, nouveautés, statut, annonces et placements. |
| `servicesApi.ts` | Lectures, création, mise à jour, suppression et activation de services. |
| `admin.ts` | Upload Storage, opérations produit, settings site/paiement, journaux, recalcul de ranking et Push Updates. |
| `center.ts` | Opérations client/admin sur `center_posts`, partage, états, groupements et upload de médias. |
| `community.ts` | Lectures/CRUD de `community_posts`. |
| `downloads.ts` | Signed URLs, journaux, jetons temporaires, validation d'expiration et marquage d'utilisation. |
| `PaymentService.ts` | Contrat d'interface pour lancer les paiements; implémentations actuelles simulées, non connectées à un prestataire réel. |
| `ai.ts` / `AIAgentSystem.tsx` | Fonctions et interface d'agents IA; ne constituent pas une API backend sécurisée ni une preuve d'intégration de modèles en production. |
| `exportService.ts` / `archiveUtils.ts` | Construction d'archives et exports effectués dans le navigateur. |
| `prismaProducts.ts` / `prismaClient.ts` | Accès Prisma depuis le bundle applicatif; à ne pas traiter comme un backend serveur sûr en l'état. |
| `netlify/functions/log-download.js` | Fonction serverless POST de journalisation seulement; son modèle Prisma ciblé ne correspond pas au schéma actuel. |

## 3B. Fonctionnalités transversales et UX

### Présentation et navigation

- Identité visuelle sombre/noir et or, avec tokens/classes de marque et
  bascule thème clair/sombre sauvegardée localement.
- Navbar fixe avec identité/logo administrable, navigation desktop, recherche,
  menu hamburger et overlay de recherche mobile.
- Navigation mobile basse défilante (`MobileRibbon`) vers Accueil, Centre,
  Store, Services, Communauté, Catégories et Roadmap.
- Ruban d'annonce global avec textes, visibilité et pages cibles configurables
  dans les settings.
- Footer, bloc d'information de marque, liens de navigation et visibilités de
  sections réglables.
- Remise en haut de page lors des changements de route via `ScrollToTop`.
- Layout responsive avec variantes mobile/tablette/desktop et zones
  défilantes pour les barres de navigation.

### Découverte, catalogue et médias

- Recherche intelligente partagée entre navbar, mobile et store; historique et
  options de recherche conservés localement.
- Filtres par catégorie/sous-type, type, OS, licence, statut et mots-clés selon
  le module et les champs disponibles.
- Cartes et grilles produit/service; carrousels/étagères horizontales et
  sections de placements (nouveau, sélection, tendance, etc.).
- Fiches produit avec galerie, captures, informations de version/OS, prix,
  mode d'accès et actions de téléchargement.
- Espace Centre AR avec catégories de publications, contenu multimédia,
  épingles, priorité et liens vers produits/services.
- Overlay/interstitiels publicitaires, AdWall et surfaces d'annonces; les
  formats présents dans l'interface ne garantissent pas l'intégration
  commerciale ou la comptabilisation réelle côté serveur.
- Chargement et erreurs : composants Loader/Skeleton/ErrorBoundary présents;
  les états détaillés et la gestion d'erreur varient selon chaque page.

### Personnalisation, accès et conversion

- Wishlist client stockée dans `localStorage`, non liée à un compte.
- Historique de recherche, thème, conversation IA et niveaux/déblocages
  Premium également enregistrés dans le stockage navigateur.
- Appels directs WhatsApp/Telegram/liens externes pour contacter les services
  et partenaires.
- Téléchargement par URL/jeton temporaires dans le code; vérifier la politique
  privée du bucket et le contrôle serveur avant mise en production.
- Modal de paiement et choix d'opérateurs visibles; sessions de checkout
  actuellement simulées, sans transaction/commande persistée ni confirmation
  serveur.

### Administration : interactions et retours UX

- Navigation par onglets, route courante mise en évidence, barre mobile
  réduite et accès aux sous-modules.
- Profil admin avec avatar/role, actions Retour, Store, Déconnexion.
- Modal d'historique des 30 dernières activités avec détails expansibles.
- Action Push Updates avec état en cours et bannière résultat.
- Écrans de formulaires et gestion pour produits, services, catégories,
  annonces, communauté et Centre; certaines créations utilisent
  `sessionStorage` pour reprendre un formulaire incomplet.
- Gestion des états de contenu : actif, publication/brouillon, projet,
  planification, archive, corbeille/restauration selon le module.
- Assistant IA flottant dans la coquille admin; fonctionnalités vocales,
  prédictives ou génération automatique listées dans la spécification comme
  pistes futures ne doivent pas être considérées comme garanties.
- Déconnexion après 15 minutes d'inactivité sur les routes admin, telle que
  configurée dans `App.tsx`.

### Parcours UX de référence

1. **Découvrir** : accueil ou navbar → store/catégorie → recherche et filtres.
2. **Évaluer** : fiche produit/service → comparer détails, versions, tarif,
   roadmap, galerie et accès/contacts.
3. **Agir** : télécharger via le flux sécurisé du code, contacter un service,
   ou ouvrir le modal de paiement (prototype simulé).
4. **Revenir** : wishlist/historique conservé sur l'appareil seulement;
   aucune bibliothèque d'achats multi-appareil n'est actuellement prévue par
   le schéma constaté.
5. **Administrer** : login Supabase → dashboard protégé → CRUD direct Supabase
   → logs et fichiers Storage.

## 4. Modèle de données repéré

Le fournisseur déclaré dans `prisma/schema.prisma` est PostgreSQL, schéma
`public`. Les 17 modèles Prisma sont :

| Table / modèle | Données principales et relations |
|---|---|
| `admins` | UUID lié au compte Auth, email, rôle, statut, profil, permissions JSON et contacts sociaux. Relation vers l'état ARDES. |
| `products` | Catalogue; descriptions, catégorie/type, licence/OS/version, fichiers et images, captures, tags, prix, placements, visibilité, accès, versions/relations JSON, formations/jeux/partenaires et roadmap. Référence `categories`; auto-référence `source_id`; dépend de `download_logs`, `download_tokens`, modules et progression. |
| `categories` | Catégories nommées et uniques; parents logiques des produits et sous-types. |
| `subtypes` | Sous-types avec `category_id`, nom et slug; unicité catégorie + nom. |
| `services` | Services/formations B2B, descriptions, fonctionnalités JSON, contacts, catégorie, prix, visibilité, placements et roadmap; auto-référence `source_id`. |
| `ads` | Média, type, position, cible, priorité, revenu, état de publication; auto-référence `source_id`. |
| `training_modules` | Modules d'une formation/produit, type, chemin fichier et ordre; FK vers `products`. |
| `training_progress` | État par utilisateur/module/produit, position et achèvement; unicité `user_id` + `module_id`. |
| `download_logs` | Journal des téléchargements : produit, utilisateur, IP/agent et date. |
| `download_tokens` | Jetons de téléchargement, produit/fichier/bucket, expiration et utilisation; FK produit. |
| `system_logs` | Journal d'activité, action, type, identifiant/email utilisateur et détails JSON. |
| `community_posts` | Publications communautaires, média, liens, épinglage, compteurs, métadonnées et suppression logique. |
| `center_posts` | Centre multimédia, contenus/médias, liens produit/service, priorité, statut, programmation, groupement et layout JSON. |
| `site_settings` | Paramètres singleton `id = current`, identité visuelle, textes, ruban, visibilité, maintenance et contenu JSON. |
| `payment_settings` | Paramètres singleton des moyens de paiement, instructions et liens checkout. |
| `branding_messages` | Messages de marque, contenu, fichier et état actif. |
| `ardes_system_state` | Mode maintenance/synchronisation ARDES, horodatage, journal et admin associé. |

### Tables ou identités utilisées hors de ce schéma Prisma

- Le frontend interroge `settings` avec des colonnes `key` et `value` pour
  `premium_config`; cette table n'apparaît pas comme modèle Prisma ni dans les
  migrations repérées.
- `auth.users` appartient à Supabase Auth; le dépôt n'a pas de modèle de
  profil client synchronisé avec cette table.
- `files` et `images` sont les noms de buckets Storage dans la documentation
  actuelle, pas des tables de catalogue.
- La fonction Netlify appelle `prisma.downloads.create`, alors que le modèle
  du schéma est `download_logs`. Ce code ne correspond pas à la génération
  Prisma actuelle.

## 5. Flux de données et fichiers

1. **Client → catalogue** : le frontend initialise `supabase-js` à partir de
   `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`, puis lit les tables
   publiques par requêtes PostgREST.
2. **Admin → contenu** : après authentification et vérification du profil
   `admins`, les écrans écrivent directement dans les tables via le même
   client Supabase; les actions et téléchargements peuvent être ajoutés à
   `system_logs` et `download_logs`.
3. **Médias/fichiers** : uploads via Supabase Storage; les lignes de données
   stockent des chemins/URLs. `downloads.ts` sait obtenir une signed URL,
   créer et vérifier un jeton, et enregistrer l'utilisation.
4. **Téléchargements** : un jeton temporaire est créé dans
   `download_tokens`; la durée de 10 minutes est également déclarée dans
   ARDES. La fonction Netlify existante ne sert pas le fichier : elle tente
   uniquement d'écrire un log.
5. **Paiements** : l'interface appelle `PaymentService`, mais les sessions
   Yabetoo/PayPal sont simulées par des temporisations et des URLs factices.
   Aucun endpoint serveur de paiement, webhook de confirmation, registre de
   transaction ou commande n'a été repéré.
6. **Archives/export** : l'admin peut produire des fichiers texte, Excel,
   PDF, Word et ZIP; les objets inclus sont préparés dans le frontend.
   L'export ZIP peut chiffrer ses fichiers avec AES. Il s'agit d'exports
   d'éléments d'archive, pas d'un dump PostgreSQL, d'un export Auth ni d'une
   copie des binaires Storage. Aucun flux d'import/restauration de ces archives
   vers une nouvelle base n'a été repéré.

### Buckets décrits

Les documents locaux décrivent :

- `files` : bucket privé, avec applications, logiciels, jeux, formations,
  versions et médias du Center;
- `images` : bucket public en lecture, avec avatars, QR codes, captures,
  couvertures, publicités, communauté et branding.

La migration de policies correspondante
`supabase/migrations/20261201_storage_policies.sql` est non suivie dans l'état
Git inspecté et datée après la date de ce relevé. Ses buckets doivent être
créés séparément; ne pas la considérer comme appliquée ou comme état vérifié
du projet distant.

## 6. Migrations et reprise des données

Le dépôt contient des migrations SQL Supabase incrémentales pour :

- colonnes de produits (formation, jeux, partenaires, licence, édition,
  classement, nom de fichier);
- champs financiers/prix et paramètres de paiement;
- champs sociaux des admins et mise à jour du branding;
- création ou évolution de `center_posts` et groupement;
- création de `download_tokens`;
- community posts et logs/realtime;
- policies Storage dans un fichier local non suivi.

Inventaire des fichiers SQL présents :

```text
supabase/migrations/
├── 20260227_add_file_name_override.sql
├── 20260227_financial_overhaul.sql
├── 20260228_community_updates.sql
├── 20261201_storage_policies.sql       # non suivi dans Git
├── add_admin_social_fields.sql
├── add_license_field.sql
├── add_product_edition.sql
├── add_ranking_position.sql
├── branding_updates.sql
├── cleaner.sql
├── create_center_grouping.sql
├── create_center_posts.sql
├── create_download_tokens.sql
├── fix_center_posts_columns.sql
├── fix_logs_realtime.sql
├── fix_products_schema.sql
└── payment_updates.sql
```

Il ne contient pas de migration initiale complète pour créer toutes les tables
du schéma Prisma. Plusieurs fichiers supposent que `products`, `services`,
`admins` et d'autres tables existent déjà. `prisma.config.ts` pointe sur
`prisma/migrations`, mais aucun dossier de migrations Prisma n'est présent.
Le seed Prisma ne crée qu'une ligne `admins` si `SUPABASE_ADMIN_ID` est fourni;
le seed SQL de produit est un échantillon et ne remplace pas un export de
données.

### Écarts de schéma à résoudre avant copie ou import

1. **Deux contrats DB** : Prisma/PostgreSQL et Supabase JS décrivent le même
   domaine sans génération commune ni preuve de synchronisation. Il faut
   choisir un contrat de référence.
2. **`downloads` contre `download_logs`** : la fonction Netlify vise un
   modèle Prisma inexistant dans le schéma fourni.
3. **`settings` absent** : la configuration premium est lue dans une table
   dont la définition n'est pas incluse dans les modèles/migrations repérés.
4. **`products.multi_types`** : Prisma le déclare `String[]`, tandis que
   `fix_products_schema.sql` le crée comme `JSONB`.
5. **`center_posts.block_id`** : Prisma l'annote en UUID; la migration SQL
   initiale le déclare `TEXT`.
6. **Storage** : `center.ts` obtient une URL publique pour des objets du
   bucket `files`, tandis que les documents Storage actuels décrivent ce
   bucket comme privé et le téléchargement par signed URL.
7. **Données authentification/clients** : aucun export/import Supabase Auth,
   modèle client, commandes, achats ou paiements confirmés n'est fourni.

### Procédure minimale conseillée pour une reconstruction fidèle

1. Choisir explicitement Supabase/PostgreSQL comme source de vérité (ou décider
   d'une migration réelle vers une API Prisma serveur); ne pas faire coexister
   silencieusement les deux accès.
2. Obtenir depuis le projet Supabase source un inventaire réel :
   tables/colonnes/contraintes/index, policies RLS, fonctions RPC/triggers,
   buckets et leurs politiques. Les fichiers du dépôt seuls ne confirment pas
   l'état distant.
3. Faire un export séparé des lignes de chaque table, des utilisateurs Auth
   si légalement et techniquement requis, et des objets de chaque bucket.
   Conserver les UUID et chemins de fichiers afin de préserver les références.
4. Préparer une migration initiale complète et déterministe, puis rejouer les
   migrations incrémentales retenues sur une base vide; régler les écarts
   `multi_types`, `block_id`, `downloads` et `settings` avant import.
5. Recréer `files` et `images` avec visibilités explicites; importer les
   objets avant ou avec leurs lignes qui les référencent; valider les signed
   URLs après import.
6. Importer les données dans l'ordre des dépendances : catégories et admins,
   produits/services, modules et contenus, logs/tokens/paramètres. Vérifier
   les volumes, UUID, FK, valeurs JSON, droits RLS et un échantillon de chaque
   parcours client/admin.
7. Utiliser des variables d'environnement distinctes pour frontend et serveur.
   Les clés service-role et URLs DB ne doivent jamais être incluses dans
   `VITE_*` ni exposées au navigateur.

## 7. Configuration et limites de reproductibilité

Les variables d'environnement frontend documentées sont
`VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`. Prisma lit `DIRECT_URL` via
`prisma.config.ts`, tandis que `.env.example` ne la documente pas. Le fichier
`.env` local n'a pas été lu; ses valeurs doivent être gérées séparément et
exclues du partage.

Le README contient des indications historiques génériques (placeholder
admin, adaptation du schéma) qui ne décrivent pas précisément le routage ou
les modèles actuels. Les spécifications existantes sont à garder comme
références fonctionnelles, mais ce relevé est plus adapté à une reconstruction
technique.

## 8. Vérifications exécutées sur l'arbre courant

- `npm run build` : réussi; Vite produit `dist/`. Avertissements relevés :
  config Vite chargée en CommonJS et imports dynamiques inefficaces.
- `npx tsc --noEmit` : échoue avant contrôle des sources, car le TypeScript
  installé rejette `moduleResolution: "Node"` (`node10` supprimé). Le build
  réussi ne remplace donc pas une validation de types.
- Les données et policies réelles de Supabase n'ont pas été interrogées; les
  résultats ci-dessus décrivent le code et les documents présents localement.
