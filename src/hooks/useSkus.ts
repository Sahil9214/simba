import {
    createSku,
    deleteSku,
    getAllSkus,
    SkuPayload,
    updateSku,
} from "@/lib/services/skus.service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

interface SkuListResponse {
    success: boolean
    data: Array<{
        id: string
        brand_name: string
        product_name: string
        size_ml: number
        mrp: string | number
        category: string
        brand_code: string
        is_active: boolean
        created_at: string
        updated_at: string
    }>
    count?: number
}

export const useSkus =()=>{
    return useQuery<SkuListResponse>({
        queryKey:['list-of-skus'],
        queryFn:()=>getAllSkus(),
        staleTime:5*60*1000,
        gcTime:10*60*1000
    })
}

export const useCreateSku = () => {
    const queryClient = useQueryClient()
    return useMutation<any, Error, SkuPayload>({
        mutationKey: ["create-sku"],
        mutationFn: (payload) => createSku(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["list-of-skus"] })
        },
    })
}

export const useUpdateSku = () => {
    const queryClient = useQueryClient()
    return useMutation<any, Error, { id: string; payload: SkuPayload }>({
        mutationKey: ["update-sku"],
        mutationFn: ({ id, payload }) => updateSku(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["list-of-skus"] })
        },
    })
}

export const useDeleteSku = () => {
    const queryClient = useQueryClient()
    return useMutation<any, Error, string>({
        mutationKey: ["delete-sku"],
        mutationFn: (id) => deleteSku(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["list-of-skus"] })
        },
    })
}