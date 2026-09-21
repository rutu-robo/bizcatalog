import { 
  AuthResponse, 
  User, 
  Website, 
  Product, 
  Asset, 
  SectionConfig, 
  PublicWebsiteData,
  UserPlan,
  Order,
  OrderStatus,
  CreateOrderPayload,
  UpdateOrderAdminPayload,
  Testimonial,
  GalleryItem,
  Category,
  Promotion
} from '../types';

const BASE_URL = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('bizcatalog_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.error || `HTTP error ${res.status}`;
    const err = new Error(errorMsg) as Error & { code?: string; limit?: number };
    if (data.code) err.code = data.code;
    if (data.limit) err.limit = data.limit;
    throw err;
  }
  return data as T;
}

export const api = {
  // Auth
  async register(payload: {
    name: string;
    email: string;
    password: string;
    subdomain: string;
    business_name: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<AuthResponse>(res);
  },

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<AuthResponse>(res);
  },

  // User Profile
  async getProfile(): Promise<User> {
    const res = await fetch(`${BASE_URL}/user/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User>(res);
  },

  async updateProfile(payload: { name?: string; plan?: UserPlan }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ user: User; token: string }>(res);
  },

  // Website
  async getMyWebsite(): Promise<Website> {
    const res = await fetch(`${BASE_URL}/website/my`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Website>(res);
  },

  async updateMyWebsite(payload: Partial<Website>): Promise<Website> {
    const res = await fetch(`${BASE_URL}/website/my`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Website>(res);
  },

  async updateTheme(theme_id: string): Promise<Website> {
    const res = await fetch(`${BASE_URL}/website/theme`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ theme_id }),
    });
    return handleResponse<Website>(res);
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${BASE_URL}/categories`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<Category[]>(res);
    return Array.isArray(data) ? data : [];
  },

  async createCategory(payload: { name: string; description?: string }): Promise<Category> {
    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Category>(res);
  },

  async updateCategory(id: string, payload: { name?: string; description?: string }): Promise<Category> {
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Category>(res);
  },

  async deleteCategory(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${BASE_URL}/products`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<Product[]>(res);
    return Array.isArray(data) ? data : [];
  },

  async createProduct(payload: Partial<Product>): Promise<Product> {
    const res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Product>(res);
  },

  async updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Product>(res);
  },

  async deleteProduct(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Assets
  async getAssets(): Promise<Asset[]> {
    const res = await fetch(`${BASE_URL}/assets`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<Asset[]>(res);
    return Array.isArray(data) ? data : [];
  },

  async uploadAsset(file: File, type: string = 'product'): Promise<Asset> {
    const token = localStorage.getItem('bizcatalog_token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const res = await fetch(`${BASE_URL}/assets/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    return handleResponse<Asset>(res);
  },

  async deleteAsset(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/assets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Sections
  async getSections(): Promise<SectionConfig[]> {
    const res = await fetch(`${BASE_URL}/website/sections`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<SectionConfig[]>(res);
    return Array.isArray(data) ? data : [];
  },

  async saveSections(sections: SectionConfig[]): Promise<SectionConfig[]> {
    const res = await fetch(`${BASE_URL}/website/sections`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ sections }),
    });
    return handleResponse<SectionConfig[]>(res);
  },

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    const res = await fetch(`${BASE_URL}/testimonials`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<Testimonial[]>(res);
    return Array.isArray(data) ? data : [];
  },

  async createTestimonial(payload: Partial<Testimonial>): Promise<Testimonial> {
    const res = await fetch(`${BASE_URL}/testimonials`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Testimonial>(res);
  },

  async deleteTestimonial(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/testimonials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Galleries
  async getGalleries(): Promise<GalleryItem[]> {
    const res = await fetch(`${BASE_URL}/galleries`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<GalleryItem[]>(res);
    return Array.isArray(data) ? data : [];
  },

  async createGallery(payload: Partial<GalleryItem>): Promise<GalleryItem> {
    const res = await fetch(`${BASE_URL}/galleries`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<GalleryItem>(res);
  },

  async deleteGallery(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/galleries/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Promotions
  async getPromotions(): Promise<Promotion[]> {
    const res = await fetch(`${BASE_URL}/promotions`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<Promotion[]>(res);
    return Array.isArray(data) ? data : [];
  },

  async createPromotion(payload: Partial<Promotion>): Promise<Promotion> {
    const res = await fetch(`${BASE_URL}/promotions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Promotion>(res);
  },

  async updatePromotion(id: string, payload: Partial<Promotion>): Promise<Promotion> {
    const res = await fetch(`${BASE_URL}/promotions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Promotion>(res);
  },

  async deletePromotion(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/promotions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Public Website
  async getPublicWebsite(subdomain: string): Promise<PublicWebsiteData> {
    const res = await fetch(`${BASE_URL}/public/website/${subdomain}`);
    return handleResponse<PublicWebsiteData>(res);
  },

  // E-Commerce Orders
  async createPublicOrder(subdomain: string, payload: CreateOrderPayload): Promise<Order> {
    const res = await fetch(`${BASE_URL}/public/website/${subdomain}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Order>(res);
  },

  async getPublicOrderByNumber(
    subdomain: string,
    orderNumber: string
  ): Promise<{ order: Order; website: Website }> {
    const res = await fetch(
      `${BASE_URL}/public/website/${subdomain}/orders/${encodeURIComponent(orderNumber)}`
    );
    return handleResponse<{ order: Order; website: Website }>(res);
  },

  async uploadPaymentProof(
    subdomain: string,
    orderNumber: string,
    file: File
  ): Promise<{ order: Order; message: string }> {
    const formData = new FormData();
    formData.append('proof', file);

    const res = await fetch(
      `${BASE_URL}/public/website/${subdomain}/orders/${encodeURIComponent(orderNumber)}/payment-proof`,
      {
        method: 'POST',
        body: formData,
      }
    );
    return handleResponse<{ order: Order; message: string }>(res);
  },

  async confirmPublicPayment(
    subdomain: string,
    orderNumber: string
  ): Promise<{ order: Order; message: string }> {
    const res = await fetch(
      `${BASE_URL}/public/website/${subdomain}/orders/${encodeURIComponent(orderNumber)}/confirm`,
      {
        method: 'POST',
      }
    );
    return handleResponse<{ order: Order; message: string }>(res);
  },

  async getOrders(): Promise<Order[]> {
    const res = await fetch(`${BASE_URL}/orders`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<Order[]>(res);
    return Array.isArray(data) ? data : [];
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<Order>(res);
  },

  async updateOrderAdmin(orderId: string, payload: UpdateOrderAdminPayload): Promise<Order> {
    const res = await fetch(`${BASE_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Order>(res);
  },
};

