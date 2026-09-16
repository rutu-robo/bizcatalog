export type UserPlan = 'free' | 'pro' | 'ultimate';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: UserPlan;
  created_at: string;
  updated_at: string;
}

export interface Website {
  id: string;
  user_id: string;
  subdomain: string;
  business_name: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  logo_url: string;
  theme_id: 'minimalist' | 'solid' | 'industrial' | 'formal' | 'lifestyle';
  primary_color?: string;
  operating_hours?: string;
  bank_name?: string;
  bank_account_no?: string;
  bank_account_name?: string;
  qris_image_url?: string;
  enable_cod?: boolean;
  enable_bank_transfer?: boolean;
  header_style?: 'solid' | 'floating' | 'dynamic-scroll';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  website_id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  website_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
}

export type AssetType = 'logo' | 'hero' | 'product' | 'gallery' | 'background';

export interface Asset {
  id: string;
  website_id: string;
  name: string;
  type: AssetType;
  url: string;
  size_bytes: number;
  created_at: string;
}

export type SectionType = 
  | 'hero' 
  | 'promos'
  | 'categories'
  | 'catalog' 
  | 'about' 
  | 'gallery' 
  | 'projects' 
  | 'testimonials' 
  | 'contact' 
  | 'footer';

export interface SectionConfig {
  id: string;
  website_id: string;
  type: SectionType;
  title: string;
  subtitle: string;
  variant: string; // default, split, centered, grid, list, banner
  is_visible: boolean;
  order: number;
  bg_color?: string;
  bg_image_url?: string;
}

export interface Testimonial {
  id: string;
  website_id: string;
  client_name: string;
  role_or_company: string;
  feedback: string;
  rating: number;
  avatar_url: string;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  website_id: string;
  title: string;
  image_url: string;
  order: number;
  created_at: string;
}

export interface PublicWebsiteData {
  website: Website;
  categories?: Category[];
  products: Product[];
  sections: SectionConfig[];
  testimonials: Testimonial[];
  galleries: GalleryItem[];
  assets: Asset[];
}

export interface AuthResponse {
  token: string;
  user: User;
  website: Website;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'waiting_verification' | 'paid' | 'refunded';

export interface OrderItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface Order {
  id: string;
  website_id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  notes?: string;
  items: OrderItem[];
  subtotal_amount?: number;
  shipping_cost?: number;
  total_amount: number;
  payment_method: string;
  payment_status: PaymentStatus;
  payment_proof_url?: string;
  shipping_method?: string;
  shipping_courier?: string;
  tracking_number?: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderPayload {
  customer_name: string;
  customer_phone: string;
  address: string;
  notes?: string;
  payment_method?: string;
  shipping_method?: string;
  shipping_cost?: number;
  items: OrderItem[];
}

export interface UpdateOrderAdminPayload {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  tracking_number?: string;
  shipping_courier?: string;
}

