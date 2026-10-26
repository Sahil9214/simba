const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

export interface ShopDetailPageData {
  header: {
    id: string;
    shop_name: string;
    dp_code: string;
    state: string;
    district: string;
    address: string;
    contact_info: any;
    last_visit_date: string;
    last_visit_formatted: string;
    is_active: boolean;
  };
  stockDetails: {
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
  };
  productCategories: {
    name: string;
    count: number;
    image: string;
  }[];
}

export interface ShopDetailPageResponse {
  success: boolean;
  data: ShopDetailPageData;
  message: string;
}

export class ShopDetailPageClientService {
  static async getShopDetailPageData(dpCode: string): Promise<ShopDetailPageData> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/seller/shop-detail/${dpCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result: ShopDetailPageResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch shop details');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching shop detail page data:', error);
      throw error;
    }
  }
}

export const shopDetailPageClientService = new ShopDetailPageClientService();
