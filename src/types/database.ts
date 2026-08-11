export type ProductLicense = 'Free' | 'Freemium' | 'Premium';
export type ProductStatus = 'New' | 'Beta' | 'Stable';
export type ProductAccessType = 'direct' | 'reward' | 'payant';

export interface Product {
    id: string;
    name: string;
    short_desc: string | null;
    description: string | null;
    type: string | null;
    multi_types: string[];
    category_id: string | null;
    license: ProductLicense | string | null;
    os: string | null;
    version: string | null;
    size: string | null;
    image: string | null;
    image_path: string | null;
    file_url: string | null;
    file_path: string | null;
    status: ProductStatus | string | null;
    tags: string[];
    access_type: ProductAccessType;
    price_fcfa: number;
    source?: 'AR BUSINESS' | 'EXTERNAL' | string;
    versions?: Array<{ label: string; url: string; size: string }>;
    created_at: string;
    updated_at: string;
    placements?: string[];
}

export interface Service {
    id: string
    name: string
    description: string | null
    long_description: string | null
    type: string | null
    sub_type?: string | null
    image: string | null
    active: boolean
    features: string[] | null
    contact_manager: string | null
    whatsapp_link: string | null
    telegram_link: string | null
    external_link: string | null
    placements?: string[]
    is_project?: boolean
    project_phase?: string
    estimated_date?: string
    roadmap?: { date: string; label: string; desc: string }[]
    created_at: string
    updated_at: string
    // Taxonomy fields
    price?: number
    price_fcfa?: number
    monetization_type?: string
    access_type?: string
    formation_domain?: string
    formation_level?: string
    formation_certificate?: string
    formation_monetization?: string
    game_genre?: string
    source?: 'AR BUSINESS' | 'EXTERNAL' | string
}

export type AdType = 'video' | 'banner' | 'reward';
export type AdRevenueType = 'internal' | 'external';

export interface Ad {
    id: string;
    title: string;
    type: AdType;
    video_url: string | null;
    media_url: string | null;
    position: string | null;
    active: boolean;
    duration: number;
    skippable: boolean;
    linked_product: string | null;
    target_url: string | null;
    revenue_type: AdRevenueType;
    priority?: number;
    created_at: string;
}
