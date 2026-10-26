import { axiosInstance } from "@/lib/axios";
import { apiEndPoints } from "../axios/axios.endpoint";

// Shape returned by GET /api/shops
export interface ShopListItem {
  id: string;
  shop_name: string;
  dp_code: string;
  corporation_id: string | null;
  state: string;
  district: string;
  address: string;
  contact_info: any | null;
  license_details: any | null;
  capacity_limit: number | null;
  is_active: boolean;
  alternate_names: string[];
  created_at: string;
  updated_at: string;
  original_dp_code: string;
  vendor_code: string;
}

// Payload for creating a shop (as per backend contract)
export interface CreateShopPayload {
  shop_name: string;
  original_dp_code: string;
  state: string;
  district: string;
  vendor_code: string;
  address: string;
  contact_info: string;
  is_active: boolean;
  alternate_names: string[];
}

export const fetchAllShopList = async (searchTerm?: string) => {
  try {
    const params = new URLSearchParams();
    if (searchTerm && searchTerm.trim()) {
      params.append("search", searchTerm.trim());
    }

    const query = params.toString();
    const url = `${apiEndPoints.listOfAllShop}${query ? `?${query}` : ""}`;

    const res = await axiosInstance.get(url);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const createShop = async (payload: CreateShopPayload) => {
  try {
    const res = await axiosInstance.post(apiEndPoints.listOfAllShop, payload);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateShop = async (
  id: string,
  payload: {
    shop_name?: string;
    original_dp_code?: string;
    state?: string;
    district?: string;
    vendor_code?: string;
    address?: string;
    contact_info?: string;
    alternate_names?: string[];
    is_active?: boolean;
  }
) => {
  try {
    const res = await axiosInstance.put(
      `${apiEndPoints.listOfAllShop}/${id}`,
      payload
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const deleteShop = async (id: string) => {
  try {
    const res = await axiosInstance.delete(
      `${apiEndPoints.listOfAllShop}/${id}`
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};