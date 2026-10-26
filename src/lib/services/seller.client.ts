/**
 * Seller Profile Client Service
 * Handles all seller-related API operations on the client side
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

export interface SellerProfileData {
  headerCounts: {
    todays_skus: number;
    weekly_skus: number;
  };
  recentVisit: RecentVisit[];
}

export interface RecentVisit {
  id: string;
  shop_name: string;
  dp_code: string;
  state: string;
  district: string;
  address: string | null;
  contact_info: string | null;
  last_visit_date: string;
  visit_count: number;
}

export interface SellerProfileResponse {
  success: boolean;
  data: SellerProfileData;
  message: string;
}

/**
 * Seller Profile Client Service
 */
export class SellerProfileClientService {
  /**
   * Fetch seller profile data
   */
  static async getSellerProfile(): Promise<SellerProfileData> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/seller/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result: SellerProfileResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch seller profile data');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      throw error;
    }
  }
}

// Export the service instance
export const sellerProfileClientService = new SellerProfileClientService();
