import { Product, Promotion } from '../types';

export interface ProductPromoInfo {
  percent: number;
  discountedPrice: number;
  badge: string;
  promoTitle: string;
  promoType: string;
}

export function getProductPromoInfo(
  product: Product,
  promotions?: Promotion[]
): ProductPromoInfo | null {
  if (!promotions || promotions.length === 0) return null;

  const activePromos = promotions.filter((p) => p.is_active);
  if (activePromos.length === 0) return null;

  for (const promo of activePromos) {
    let isTargeted = false;

    if (promo.target_type === 'all') {
      isTargeted = true;
    } else if (promo.target_type === 'category' && promo.target_category) {
      isTargeted =
        (product.category || '').trim().toLowerCase() ===
        promo.target_category.trim().toLowerCase();
    } else if (promo.target_type === 'products' && Array.isArray(promo.product_ids)) {
      isTargeted = promo.product_ids.includes(product.id);
    }

    if (isTargeted && promo.discount_percent && promo.discount_percent > 0) {
      const discountedPrice = Math.round(
        product.price * (1 - promo.discount_percent / 100)
      );
      return {
        percent: promo.discount_percent,
        discountedPrice,
        badge: promo.badge || `-${promo.discount_percent}%`,
        promoTitle: promo.title,
        promoType: promo.type,
      };
    }
  }

  return null;
}
