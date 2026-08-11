// ============================================================
//  AR BUSINESS STORE — TAXONOMY MASTER CONFIG v3.0
//  Centralise toutes les catégories, sous-types, plateformes,
//  formats de formation, monétisation et placements.
// ============================================================

export interface CategoryConfig {
    subtypes: string[]
    platforms?: string[]
    licensing?: string[]
    formats?: string[]
    domains?: string[]        // Domaines thématiques de formation
    monetizationTypes?: string[] // Modèles de monétisation spécifiques à la formation
    gameGenres?: string[]     // Genres de jeu
}

export const CATEGORIES_CONFIG: Record<string, CategoryConfig> = {

    // ────────────────────────────────────────────────────────
    //  APPLICATION MOBILE & DESKTOP
    // ────────────────────────────────────────────────────────
    'Application': {
        subtypes: [
            // Productivité & Business
            'Productivité & Bureautique',
            'Finance & Comptabilité',
            'Gestion de Projet',
            'Facturation & Devis',
            'CRM & Relation Client',
            'Ressources Humaines (RH)',
            // Social & Communication
            'Réseaux Sociaux',
            'Messagerie & Chat',
            'Appels Vidéo & Conférence',
            'Communauté & Forum',
            // Médias & Divertissement
            'Musique & Audio',
            'Vidéo & Streaming',
            'Photo & Retouche',
            'Lecture & E-Book',
            // Santé & Lifestyle
            'Santé & Fitness',
            'Méditation & Bien-être',
            'Nutrition & Alimentation',
            'Sport & Exercice',
            // Utilitaires
            'Navigation & Cartographie',
            'Météo',
            'Traduction & Langue',
            'Utilitaires Système',
            // E-Commerce
            'Boutique & E-Commerce',
            'Livraison & Logistique',
            'Comparateur de Prix',
            // Éducation
            'Apprentissage & Éducation',
            'Quiz & Exercices',
            'Langue & Alphabétisation',
        ],
        platforms: [
            'Android (APK)',
            'iOS (iPhone & iPad)',
            'Windows (Microsoft Store)',
            'Mac OS',
            'Web App (PWA)',
            'Linux',
        ]
    },

    // ────────────────────────────────────────────────────────
    //  LOGICIEL (DESKTOP / SERVEUR)
    // ────────────────────────────────────────────────────────
    'Logiciel': {
        subtypes: [
            // Créativité & Médias
            'Design Graphique & UI/UX',
            'Montage Vidéo',
            'Production Musicale (DAW)',
            'Modélisation 3D & Animation',
            'Retouche Photo',
            'Traitement Audio',
            // Développement
            'IDE & Éditeur de Code',
            'Débogage & Tests',
            'Versioning & Collaboration (Git)',
            'Base de Données (SGBD)',
            'API & Intégration',
            // IA & Automatisation
            'Intelligence Artificielle',
            'Automatisation RPA',
            'Traitement de Données & Data Science',
            'Machine Learning Framework',
            // Bureautique
            'Suite Bureautique',
            'PDF & Documents',
            'Agenda & Planification',
            'Archivage & Compression',
            // Sécurité & Réseau
            'Antivirus & Protection',
            'VPN & Anonymat',
            'Firewall & Sécurité Réseau',
            'Récupération de Données',
            // Serveur & Infrastructure
            'Serveur Web (Apache / Nginx)',
            'Virtualisation & Conteneurs',
            'Sauvegarde & Backup',
            'Monitoring Système',
            // E-Business
            'CMS & Plateforme Web',
            'ERP (Gestion d\'Entreprise)',
            'Logiciel de Facturation',
        ],
        platforms: [
            'Windows 10/11',
            'Windows 7/8',
            'Mac OS',
            'Linux (Debian/Ubuntu)',
            'Linux (Red Hat/Fedora)',
            'Cross-Platform',
            'Web (SaaS)',
        ],
        licensing: [
            'Gratuit & Open Source',
            'Gratuit (Publicités)',
            'Freemium',
            'Licence Unique (Perpétuelle)',
            'Abonnement Mensuel',
            'Abonnement Annuel',
            'Licence Entreprise',
        ]
    },

    // ────────────────────────────────────────────────────────
    //  JEU VIDÉO — multi-plateforme complet
    // ────────────────────────────────────────────────────────
    'Jeu': {
        subtypes: [
            // Plateformes Mobiles
            'Mobile — Hors Ligne (Android)',
            'Mobile — En Ligne (Android)',
            'Mobile — Hors Ligne (iOS)',
            'Mobile — En Ligne (iOS)',
            // PC / Desktop
            'PC — Windows (Hors Ligne)',
            'PC — Windows (En Ligne / Multijoueur)',
            'PC — Linux',
            'PC — Mac',
            // Consoles Rétro & Émulation
            'PSP (PPSSPP Emulateur)',
            'PlayStation 1 (PS1)',
            'PlayStation 2 (PS2)',
            'PlayStation 3 (PS3)',
            'Nintendo DS / 3DS',
            'Game Boy Advance (GBA)',
            'Sega Mega Drive',
            // Navigateur & Web
            'Jeu Navigateur (WebGL)',
            'Flash / HTML5',
        ],
        gameGenres: [
            'Action & Combat',
            'Aventure & Exploration',
            'RPG (Rôle)',
            'MMORPG (Multijoueur Massivement En Ligne)',
            'FPS (Tir à la Première Personne)',
            'Battle Royale',
            'Stratégie & Tactique (RTS)',
            'Sport (Foot, Basket…)',
            'Course & Racing',
            'Simulation & Gestion',
            'Horreur & Survival',
            'Puzzle & Réflexion',
            'Arcade & Casual',
            'Plateforme & Jump',
            'Musique & Rythme',
        ],
        platforms: [
            'Android',
            'iOS',
            'Windows',
            'Linux',
            'Mac',
            'Émulateur (PPSSPP, ePSXe…)',
            'Navigateur Web',
        ]
    },

    // ────────────────────────────────────────────────────────
    //  FORMATION — avec domaines + formats + monétisation
    // ────────────────────────────────────────────────────────
    'Formation': {
        subtypes: [
            // Numérique & Tech
            'Programmation & Développement Web',
            'Développement Mobile (Android / iOS)',
            'Intelligence Artificielle & Machine Learning',
            'Cybersécurité & Ethical Hacking',
            'Réseaux & Administration Système',
            'Base de Données (SQL / NoSQL)',
            'Cloud Computing (AWS, Azure, GCP)',
            'DevOps & CI/CD',
            'Data Science & Analyse de Données',
            // Business & Commerce
            'E-Commerce & Boutique en Ligne',
            'Dropshipping & Import-Export',
            'Entrepreneuriat & Création d\'Entreprise',
            'Comptabilité & Finance d\'Entreprise',
            'Gestion de Projet (PMP, Agile)',
            'Ressources Humaines & Management',
            // Marketing Digital
            'Marketing Digital & Réseaux Sociaux',
            'SEO & Référencement',
            'Publicité Digitale (Google Ads, Meta Ads)',
            'Email Marketing & Automation',
            'Copywriting & Rédaction Web',
            // Cryptomonnaie & Finance
            'Crypto & Blockchain',
            'Trading & Bourse',
            'NFT & Web3',
            'DeFi (Finance Décentralisée)',
            // Design & Créativité
            'Design Graphique & Identité Visuelle',
            'UI/UX Design',
            'Montage Vidéo & Motion Design',
            'Production Musicale',
            'Photographie Professionnelle',
            // Santé & Sciences
            'Médecine & Sciences Biomédicales',
            'Pharmacologie',
            'Nutrition & Diététique',
            'Psychologie & Développement Personnel',
            'Kinésithérapie & Sport Santé',
            // Langues & Culture
            'Anglais Professionnel',
            'Français (FLE)',
            'Langues Africaines',
            'Espagnol / Portugais',
            'Arabe',
            // Développement Personnel
            'Mindset & Mentalité Succès',
            'Leadership & Communication',
            'Productivité Personnelle',
            'Finance Personnelle & Épargne',
        ],
        domains: [
            'Informatique & Numérique',
            'E-Business & E-Commerce',
            'Médecine & Santé',
            'Marketing & Communication',
            'Crypto & Finance',
            'Design & Créativité',
            'Langues',
            'Développement Personnel',
            'Droit & Juridique',
            'Agriculture & Agri-Tech',
        ],
        formats: [
            'Formation En Ligne — Vidéo (Pack Téléchargeable)',
            'Formation En Ligne — Live / Webinaire',
            'Formation Hors Ligne — Présentiel',
            'Formation Hors Ligne — Présentiel + Vidéos',
            'E-Book / Guide PDF',
            'Coaching 1:1 (Session Individuelle)',
            'Programme Complet (Multi-modules)',
            'Mini-Cours (Moins de 2h)',
        ],
        monetizationTypes: [
            'Gratuit (Accès Libre)',
            'Freemium (Modules de base gratuits)',
            'Paiement Unique (Accès à Vie)',
            'Abonnement Mensuel',
            'Abonnement Annuel',
            'Accès via Visionnage Publicitaire (Ads)',
            'Paiement à la Séance',
            'Paiement Fractionné / Crédit',
            'Pack Entreprise (Multi-utilisateurs)',
        ]
    },

    // ────────────────────────────────────────────────────────
    //  OUTIL — utilitaires & outils professionnels
    // ────────────────────────────────────────────────────────
    'Outil': {
        subtypes: [
            // Réseau & Wi-Fi
            'Analyseur Wi-Fi & Réseau',
            'Partage de Connexion & VPN',
            'Monitoring Bande Passante',
            'Scan Ports & Sécurité Réseau',
            // Automatisation
            'Automatisation de Tâches (Desktop)',
            'Automatisation Web (Scraping)',
            'Gestionnaire de Macros',
            'Planificateur de Tâches',
            // Optimisation Système
            'Nettoyeur & Optimiseur Système',
            'Gestionnaire de Démarrage',
            'Accélérateur RAM & Processeur',
            // Analyse & Data
            'Analyse de Données & Dashboards',
            'Statistiques & Reporting',
            'Conversion de Fichiers',
            // Marketing & Croissance
            'Générateur de Leads',
            'Outil de Veille Concurrentielle',
            'Email Marketing & CRM',
            'Analytics & Tracking',
            // Sécurité
            'Gestionnaire de Mots de Passe',
            'Chiffrement de Fichiers',
            'Antivirus & Anti-malware',
            // Communication
            'Outil de Collaboration Équipe',
            'Générateur de Contenu IA',
            'Outil de Planification Réseaux Sociaux',
        ],
        platforms: [
            'Windows',
            'Mac OS',
            'Linux',
            'Android',
            'iOS',
            'Web (Extension / Plugin)',
            'Cross-Platform',
        ]
    },

    // ────────────────────────────────────────────────────────
    //  RESSOURCE — contenus téléchargeables & créatifs
    // ────────────────────────────────────────────────────────
    'Ressource': {
        subtypes: [
            'Templates UI/UX (Figma, Adobe XD)',
            'Templates Sites Web (HTML, React, Vue)',
            'Templates Présentations (PowerPoint, Canva)',
            'Thèmes CMS (WordPress, Shopify)',
            'Assets Graphiques & Illustrations',
            'Icônes & Icon Packs',
            'Polices / Fonts Premium',
            'Photographies Stock',
            'Vidéos Stock & Motion',
            'Sons & Samples Musicaux',
            'Scripts & Snippets de Code',
            'Plugins WordPress',
            'Extension VSCode / IDE',
            'Base de Données (CSV, JSON)',
            'E-Books & Guides Pratiques',
            'Modèles de Documents (Facture, Contrat)',
            'Prompts IA (ChatGPT, Midjourney)',
            'Pack Réseaux Sociaux (Templates Posts)',
        ],
        platforms: [
            'Tous (Format Universel)',
            'Figma',
            'Adobe XD / Illustrator / Photoshop',
            'WordPress',
            'Canva',
            'Android Studio',
            'Visual Studio Code',
        ]
    },

    // ────────────────────────────────────────────────────────
    //  SERVICE — offres de services numériques & business
    // ────────────────────────────────────────────────────────
    'Service': {
        subtypes: [
            // Solutions Techniques
            'Développement Web & Application',
            'Développement Mobile sur Mesure',
            'Hébergement & Maintenance Site',
            'Cybersécurité & Audit',
            'Intégration API & Systèmes',
            'Migration Cloud',
            // Business & Consulting
            'Conseil en Transformation Digitale',
            'Accompagnement E-Commerce',
            'Business Plan & Étude de Marché',
            'Conseil Juridique & Startup',
            'Conseil en Investissement',
            // Marketing
            'Community Management',
            'Création de Contenu (Texte, Vidéo)',
            'Publicité Digitale (Google, Meta Ads)',
            'Référencement SEO',
            'Stratégie de Croissance (Growth Hacking)',
            // Design & Créatif
            'Identité Visuelle & Branding',
            'Conception UI/UX',
            'Motion Design & Animation',
            'Montage Vidéo & Post-Production',
            // Logistique & E-Commerce
            'Logistique & Livraison',
            'Gestion des Commandes & Stocks',
            'Intégration Paiement en Ligne',
            // Système Digital
            'Système ERP sur Mesure',
            'Tableau de Bord & Reporting',
            'Automatisation de Processus',
            'Système de Gestion (CRM sur Mesure)',
        ],
        platforms: [
            'En Ligne (Prestation Distance)',
            'Sur Site (Présentiel Congo)',
            'Hybride (En Ligne + Présentiel)',
        ]
    },
}

// ============================================================
//  OPTIONS DE MONÉTISATION GLOBALES
// ============================================================
export const MONETIZATION_OPTIONS = [
    { value: 'free', label: 'Gratuit', emoji: '🆓' },
    { value: 'free_ads', label: 'Gratuit avec Pubs', emoji: '📺' },
    { value: 'freemium', label: 'Freemium', emoji: '⚡' },
    { value: 'paid', label: 'Payant (Achat Unique)', emoji: '💳' },
    { value: 'premium', label: 'Premium (Vente Directe)', emoji: '👑' },
    { value: 'subscription_monthly', label: 'Abonnement Mensuel', emoji: '📅' },
    { value: 'subscription_annual', label: 'Abonnement Annuel', emoji: '📆' },
    { value: 'ads', label: 'Accès via Ads', emoji: '📺' },
]

// ============================================================
//  PLACEMENTS — Sections du Store & Vitrine
// ============================================================
export const PLACEMENTS = [
    // Visibilité Front (Store)
    { id: 'top_10', label: 'Top 10 Meilleures Notes', emoji: '⭐' },
    { id: 'trending', label: 'Tendances du moment', emoji: '🔥' },
    { id: 'featured', label: 'En Vedette (Mise en avant)', emoji: '💎' },
    { id: 'editors_choice', label: 'Choix de la Rédaction', emoji: '🏆' },

    // Statut Produit
    { id: 'beta_test', label: 'Bêta-Test Public', emoji: '🧪' },
    { id: 'active_dev', label: 'En Développement Actif', emoji: '🔧' },
    { id: 'coming_soon', label: 'Bientôt Disponible', emoji: '⏳' },

    // Promotions
    { id: 'promo', label: 'Promotion & Réduction', emoji: '🎁' },
    { id: 'flash_sale', label: 'Vente Flash (Temps Limité)', emoji: '⚡' },
    { id: 'free_trial', label: 'Essai Gratuit Disponible', emoji: '🆓' },

    // Niches & Sections spéciales
    { id: 'formation_week', label: 'Formation de la Semaine', emoji: '🎓' },
    { id: 'game_of_week', label: 'Jeu de la Semaine', emoji: '🎮' },
    { id: 'tool_spotlight', label: 'Outil à la Loupe', emoji: '🔍' },
    { id: 'partner', label: 'Partenaire AR BUSINESS', emoji: '🤝' },

    // Section Projet
    { id: 'project_mode', label: 'Mode Projet (Collaboratif)', emoji: '📁' },
]


// ============================================================
//  OS / PLATEFORMES GLOBALES (pour les filtres store)
// ============================================================
export const OS_LIST = [
    'Android',
    'iOS',
    'Windows',
    'Mac OS',
    'Linux',
    'Web / Navigateur',
    'Cross-Platform',
    'PPSSPP (Émulateur PSP)',
    'PS1 / PS2 / PS3 (Émulateur)',
]

// ============================================================
//  TYPES DE FORMATION — config rich pour le formulaire admin
// ============================================================
export const FORMATION_CONFIG = {
    formats: [
        { id: 'video_pack', label: 'Pack Vidéo Téléchargeable', hasModules: true },
        { id: 'live_stream', label: 'Formation En Ligne — Live / Webinaire', hasModules: false },
        { id: 'presentiel', label: 'Formation Présentielle (Sur Place)', hasModules: false },
        { id: 'presentiel_video', label: 'Présentiel + Pack Vidéo', hasModules: true },
        { id: 'ebook', label: 'E-Book / Guide PDF', hasModules: false },
        { id: 'coaching', label: 'Coaching 1:1 Individuel', hasModules: false },
        { id: 'complete_program', label: 'Programme Complet Multi-modules', hasModules: true },
        { id: 'mini_course', label: 'Mini-Cours (Moins de 2h)', hasModules: true },
    ],
    levels: [
        { id: 'debutant', label: '🟢 Débutant (Aucune Base Requise)' },
        { id: 'intermediaire', label: '🟡 Intermédiaire' },
        { id: 'avance', label: '🔴 Avancé' },
        { id: 'expert', label: '⚫ Expert / Professionnel' },
        { id: 'all_levels', label: '🌐 Tous Niveaux' },
    ],
    certificates: [
        { id: 'none', label: 'Sans Certificat' },
        { id: 'ar_business', label: '🏅 Certificat AR BUSINESS' },
        { id: 'professional', label: '🎖️ Certificat Professionnel Reconnu' },
    ]
}
