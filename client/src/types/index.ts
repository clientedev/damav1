export interface HeroConfig {
  slideshow_enabled: boolean;
  transition_duration: number;
  transition_effect: 'fade' | 'zoom' | 'slide';
  overlay_darkness: number;
  overlay_blur?: string;
  video_enabled?: boolean;
  video_url?: string;
  logo_url: string;
  logo_size_desktop: number;
  logo_size_mobile: number;
  tagline: string;
  subtitle: string;
  cta_primary_text: string;
  cta_primary_link: string;
  cta_secondary_text: string;
  cta_secondary_link: string;
}

export interface HeroSlide {
  id: number;
  image_desktop: string;
  image_mobile?: string;
  title?: string;
  subtitle?: string;
  order_index: number;
  is_active: number | boolean;
}

export interface GeneralSettings {
  company_name: string;
  founded_date: string;
  description: string;
  address_full: string;
  address_street?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_cep?: string;
  google_maps_url: string;
  whatsapp: string;
  whatsapp_url: string;
  instagram_url: string;
  business_hours: string;
  logo_principal: string;
  logo_nav_footer: string;
  logo_badge: string;
  parceiros_grid: string;
  parceiro_omint: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

export interface ValueItem {
  item: string;
  descricao: string;
}

export interface AboutContent {
  title: string;
  text_conheca: string;
  image_equipe: string;
  banner_sobre: string;
  arte_sobre: string;
  missao: string;
  visao: string;
  valores: ValueItem[];
}

export interface Photo {
  id: number;
  album_id: number;
  url: string;
  title: string;
  alt_text: string;
  caption?: string;
  width?: number;
  height?: number;
  order_index: number;
  is_active: number | boolean;
}

export interface Album {
  id: number;
  slug: string;
  title: string;
  destination: string;
  category: string;
  year?: string;
  cover_image: string;
  description: string;
  order_index: number;
  is_active: number | boolean;
  photo_count?: number;
  photos?: Photo[];
}

export interface Product {
  id: number;
  slug: string;
  title: string;
  tag: string;
  description: string;
  card_image: string;
  features: string[];
  order_index: number;
  is_active: number | boolean;
}

export interface ExclusiveBenefit {
  id: number;
  title: string;
  description: string;
  icon: string;
  order_index: number;
  is_active: number | boolean;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  stars: number;
  avatar?: string;
  order_index: number;
  is_active: number | boolean;
}

export interface ClaimFaq {
  id: number;
  question: string;
  answer: string;
  steps: string[];
  order_index: number;
  is_active: number | boolean;
}

export interface InstagramPost {
  id: number;
  post_url: string;
  title: string;
  category: string;
  embed_html?: string;
  image_url?: string;
  order_index: number;
  is_active: number | boolean;
}

export interface SectionItem {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

export interface SiteDataResponse {
  hero: {
    config: HeroConfig;
    slides: HeroSlide[];
  };
  settings: GeneralSettings;
  about: AboutContent;
  albums: Album[];
  products: Product[];
  benefits: ExclusiveBenefit[];
  testimonials: Testimonial[];
  claims: ClaimFaq[];
  instagram: InstagramPost[];
  sections_order?: SectionItem[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}
