const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

export interface ShopHeader {
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
}

export interface StockDetails {
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
}

export interface ProductCategory {
  name: string;
  count: number;
  image: string;
}

export interface ShopDetailData {
  header: ShopHeader;
  stockDetails: StockDetails;
  productCategories: ProductCategory[];
}

export interface ShopDetailResponse {
  success: boolean;
  data: ShopDetailData;
  message: string;
}

export interface ImageUploadData {
  image_id: string;
  shop_id: string;
  dp_code: string;
  file_name: string;
  file_size: number;
  content_type: string;
  s3_key: string;
  s3_url: string;
  uploaded_at: string;
}

export interface ImageUploadResponse {
  success: boolean;
  data: ImageUploadData;
  message: string;
}

export interface ImageListData {
  dp_code: string;
  images: {
    id: string;
    file_name: string;
    file_size: number;
    content_type: string;
    s3_key: string;
    s3_url: string;
    uploaded_at: string;
    shop_name: string;
  }[];
}

export interface ImageListResponse {
  success: boolean;
  data: ImageListData;
  message: string;
}

export class ShopDetailClientService {
  static async getShopDetails(dpCode: string): Promise<ShopDetailData> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/seller/shop/${dpCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result: ShopDetailResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch shop details');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching shop details:', error);
      throw error;
    }
  }

  static async uploadImage(dpCode: string, file: File): Promise<ImageUploadData> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/api/seller/shop/${dpCode}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result: ImageUploadResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to upload image');
      }

      return result.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  static async getShopImages(dpCode: string): Promise<ImageListData> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/seller/shop/${dpCode}/upload`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result: ImageListResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch shop images');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching shop images:', error);
      throw error;
    }
  }
}

export const shopDetailClientService = new ShopDetailClientService();
