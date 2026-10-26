import { axiosInstance } from "../axios"
import { apiEndPoints } from "../axios/axios.endpoint"

export interface SkuItem {
    id: string
    brand_name: string
    product_name: string
    size_ml: number
    mrp: string | number
    category: string
    brand_code: string
    supplier_details: unknown | null
    alternate_names: string[] | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export const getAllSkus = async()=>{
    try {
        const res = await axiosInstance.get(apiEndPoints.listOfAllSkus);
        return res.data
    } catch (error) {
         throw error
    }
}

export interface SkuPayload {
    brand_name: string
    product_name: string
    brand_code: string
    category: string
    size_ml: number
    mrp: number
    is_active: boolean
}

export const createSku = async (payload: SkuPayload) => {
    try {
        const res = await axiosInstance.post(apiEndPoints.listOfAllSkus, payload)
        return res.data
    } catch (error) {
        throw error
    }
}

export const updateSku = async (id: string, payload: SkuPayload) => {
    try {
        const res = await axiosInstance.put(apiEndPoints.skuById(id), payload)
        return res.data
    } catch (error) {
        throw error
    }
}

export const deleteSku = async (id: string) => {
    try {
        const res = await axiosInstance.delete(apiEndPoints.skuById(id))
        return res.data
    } catch (error) {
        throw error
    }
}