"use client"
import React, { useMemo, useRef, useState } from "react"
import { Beer, Edit2, Plus, Search, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { showToast } from "@/components/ui/toast"
import { DUMMY_SKUS } from "@/lib/constants/dummyData"
import { useDebounced } from "@/hooks/useDebounce"
import { useEffect } from "react"
interface SkuFormState {
    brand_name: string
    product_name: string
    brand_code: string
    category: string
    size_ml: string
    mrp: string
    is_active: boolean
}

interface SkuRow {
    id: string
    brand_name: string
    product_name: string
    brand_code: string
    category: string
    size_ml: number
    mrp: string | number
    is_active: boolean
}

const CATEGORY_OPTIONS = ["BEER", "WHISKY", "VODKA"] as const

const initialFormState: SkuFormState = {
    brand_name: "",
    product_name: "",
    brand_code: "",
    category: "",
    size_ml: "",
    mrp: "",
    is_active: true,
}

const AddSkus = () => {
    const [skus, setSkus] = useState<SkuRow[]>(() =>
        DUMMY_SKUS.map((s) => ({
            id: s.id,
            brand_name: s.brand_name,
            product_name: s.product_name || s.name,
            brand_code: s.brandCode || s.id,
            category: s.category,
            size_ml: s.size_ml,
            mrp: s.mrp,
            is_active: s.is_active,
        }))
    )
    const [search, setSearch] = useState("")
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [form, setForm] = useState<SkuFormState>(initialFormState)
    const [editSku, setEditSku] = useState<SkuRow | null>(null)
    const [deleteSkuState, setDeleteSkuState] = useState<{ id: string; name: string } | null>(null)
    const focusSearch = useRef<HTMLInputElement>(null)
    const debouncedSearch = useDebounced(search, 300)
    const isLoading = false

    useEffect(() => {
        focusSearch.current?.focus()
    }, [])

    const filteredSkus = useMemo(() => {
        const keyword = debouncedSearch.trim().toLowerCase()
        if (!keyword) return skus
        return skus.filter((sku) => {
            const brand = sku.brand_name?.toLowerCase() ?? ""
            const product = sku.product_name?.toLowerCase() ?? ""
            const code = sku.brand_code?.toLowerCase() ?? ""
            const category = sku.category?.toLowerCase() ?? ""
            const size = String(sku.size_ml ?? "")
            return (
                brand.includes(keyword) ||
                product.includes(keyword) ||
                code.includes(keyword) ||
                category.includes(keyword) ||
                size.includes(keyword)
            )
        })
    }, [debouncedSearch, skus])

    const handleFormChange = (field: keyof SkuFormState, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    const validateAndBuildPayload = (state: SkuFormState) => {
        const brandName = state.brand_name.trim()
        const productName = state.product_name.trim()
        const brandCode = state.brand_code.trim().toUpperCase()
        const category = state.category.trim().toUpperCase()
        const sizeMl = Number(state.size_ml)
        const mrpValue = Number(state.mrp)

        if (!brandName || !productName || !brandCode || !category) {
            showToast("error", "Brand, product, brand code and category are required")
            return null
        }
        if (!Number.isFinite(sizeMl) || sizeMl <= 0) {
            showToast("error", "Pack size must be a valid number")
            return null
        }
        if (!Number.isFinite(mrpValue) || mrpValue <= 0) {
            showToast("error", "MRP must be a valid amount")
            return null
        }

        return {
            brand_name: brandName,
            product_name: productName,
            brand_code: brandCode,
            category,
            size_ml: sizeMl,
            mrp: Number(mrpValue.toFixed(2)),
            is_active: state.is_active,
        }
    }

    const openEditModal = (sku: SkuRow) => {
        setEditSku(sku)
        setForm({
            brand_name: sku.brand_name,
            product_name: sku.product_name,
            brand_code: sku.brand_code,
            category: sku.category,
            size_ml: String(sku.size_ml),
            mrp: String(sku.mrp),
            is_active: sku.is_active,
        })
        setIsEditModalOpen(true)
    }

    const resetForm = () => setForm(initialFormState)

    return (
        <main className="min-h-screen py-4 sm:py-2">
            <div className="w-full space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-linear-to-b from-[#FF4250] to-[#D73742] p-2 text-white shadow-sm">
                            <Beer className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-semibold leading-6 text-charcoal-black">
                                SKU Management
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                Create, update and manage product SKUs.
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => {
                            resetForm()
                            setIsAddModalOpen(true)
                        }}
                        className="inline-flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 shadow-sm w-full sm:w-auto"
                    >
                        <Plus className="w-4 h-4" />
                        Add SKU
                    </Button>
                </div>

                <Card className="bg-white border border-[rgba(0,0,0,0.1)] rounded-2xl p-4 space-y-4">
                    <div className="flex flex-col lg:flex-row justify-between gap-3 items-start lg:items-center">
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold text-[#000000]">SKUs</h2>
                            <p className="text-xs sm:text-sm text-placeholder-gray">
                                Total {filteredSkus.length} records
                            </p>
                        </div>

                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-placeholder-gray" />
                            <Input
                                placeholder="Search by brand, product, code..."
                                value={search}
                                ref={focusSearch}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full h-10 pl-10 pr-3 border border-[#E5E5E5] rounded-lg text-sm text-sidebar-foreground focus:ring-0 focus:border-[#E5E5E5]"
                            />
                        </div>
                    </div>

                    <div className="border border-[#E5E5E5] rounded-lg overflow-hidden">
                        <div className="max-h-[70vh] overflow-y-auto">
                            <Table className="w-full table-fixed">
                                <TableHeader className="sticky top-0 z-10 bg-tertiary-color">
                                    <TableRow className="h-10 border-b border-[#E5E5E5]">
                                        <TableHead className="w-[130px] text-sm font-medium text-placeholder-gray">Brand</TableHead>
                                        <TableHead className="w-[220px] text-sm font-medium text-placeholder-gray">Product</TableHead>
                                        <TableHead className="w-[100px] text-sm font-medium text-placeholder-gray">Code</TableHead>
                                        <TableHead className="w-[100px] text-sm font-medium text-placeholder-gray">Category</TableHead>
                                        <TableHead className="w-[90px] text-sm font-medium text-placeholder-gray">Size</TableHead>
                                        <TableHead className="w-[90px] text-sm font-medium text-placeholder-gray">MRP</TableHead>
                                        <TableHead className="w-[120px] text-sm font-medium text-placeholder-gray">Status</TableHead>
                                        <TableHead className="w-[110px] text-sm font-medium text-placeholder-gray text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-20 text-center text-sm text-placeholder-gray">
                                                Loading SKUs...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredSkus.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-20 text-center text-sm text-placeholder-gray">
                                                No SKUs found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredSkus.map((sku, index) => (
                                            <TableRow
                                                key={sku.id}
                                                className={`h-[56px] border-b border-[#E5E5E5] ${index % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}`}
                                            >
                                                <TableCell className="w-[130px] text-sm font-medium text-sidebar-foreground">{sku.brand_name}</TableCell>
                                                <TableCell className="w-[220px] text-sm text-sidebar-foreground truncate">{sku.product_name}</TableCell>
                                                <TableCell className="w-[100px] text-sm text-sidebar-foreground">{sku.brand_code}</TableCell>
                                                <TableCell className="w-[100px] text-sm text-sidebar-foreground">{sku.category}</TableCell>
                                                <TableCell className="w-[90px] text-sm text-sidebar-foreground">{sku.size_ml} ml</TableCell>
                                                <TableCell className="w-[90px] text-sm text-sidebar-foreground">Rs. {sku.mrp}</TableCell>
                                                <TableCell className="w-[120px]">
                                                    <div className="flex items-center gap-2">
                                                        <Switch className="cursor-pointer"
                                                            id={`sku-status-${sku.id}`}
                                                            checked={sku.is_active}
                                                            onCheckedChange={(checked) => {
                                                                setSkus((prev) =>
                                                                    prev.map((s) =>
                                                                        s.id === sku.id ? { ...s, is_active: checked } : s
                                                                    )
                                                                )
                                                                showToast("success", `SKU marked as ${checked ? "active" : "inactive"}`)
                                                            }}
                                                        />
                                                        <span className="text-xs font-medium">{sku.is_active ? "Active" : "Inactive"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="w-[110px]">
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 px-2 text-xs"
                                                            onClick={() => openEditModal(sku)}
                                                        >
                                                            <Edit2 className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 px-2 text-xs border-red-200 text-red-600 hover:bg-red-50"
                                                            onClick={() => {
                                                                setDeleteSkuState({
                                                                    id: sku.id,
                                                                    name: `${sku.brand_name} - ${sku.product_name} (${sku.size_ml}ml)`,
                                                                })
                                                                setIsDeleteModalOpen(true)
                                                            }}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </Card>
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New SKU">
                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault()
                        const payload = validateAndBuildPayload(form)
                        if (!payload) return
                        const newSku: SkuRow = {
                            id: `sku-${Date.now()}`,
                            brand_name: payload.brand_name,
                            product_name: payload.product_name,
                            brand_code: payload.brand_code,
                            category: payload.category,
                            size_ml: payload.size_ml,
                            mrp: payload.mrp,
                            is_active: payload.is_active,
                        }
                        setSkus((prev) => [newSku, ...prev])
                        showToast("success", "SKU created successfully")
                        setIsAddModalOpen(false)
                        resetForm()
                    }}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-1" htmlFor="brand_name">Brand Name</Label>
                            <Input
                                id="brand_name"
                                value={form.brand_name}
                                onChange={(e) => handleFormChange("brand_name", e.target.value)}
                                placeholder="Kingfisher"
                                required
                            />
                        </div>
                        <div>
                            <Label className="mb-1" htmlFor="product_name">Product Name</Label>
                            <Input
                                id="product_name"
                                value={form.product_name}
                                onChange={(e) => handleFormChange("product_name", e.target.value)}
                                placeholder="Premium Lager"
                                required
                            />
                        </div>
                        <div>
                            <Label className="mb-1" htmlFor="brand_code">Brand Code</Label>
                            <Input
                                id="brand_code"
                                value={form.brand_code}
                                onChange={(e) => handleFormChange("brand_code", e.target.value)}
                                placeholder="KF001"
                                required
                            />
                        </div>
                        <div>
                            <Label className="mb-1" htmlFor="category">Category</Label>
                            <Select value={form.category} onValueChange={(value) => handleFormChange("category", value)}>
                                <SelectTrigger id="category" className="w-full">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORY_OPTIONS.map((item) => (
                                        <SelectItem key={item} value={item}>
                                            {item}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="mb-1" htmlFor="size_ml">Size (ml)</Label>
                            <Input
                                id="size_ml"
                                value={form.size_ml}
                                onChange={(e) => handleFormChange("size_ml", e.target.value)}
                                placeholder="330"
                                inputMode="numeric"
                                required
                                type="number"
                            />
                        </div>
                        <div>
                            <Label className="mb-1" htmlFor="mrp">MRP</Label>
                            <Input
                                id="mrp"
                                value={form.mrp}
                                onChange={(e) => handleFormChange("mrp", e.target.value)}
                                placeholder="120"
                                inputMode="decimal"
                                required
                                type="number"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-dashed border-gray-200">
                        <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-linear-to-b from-[#FF4250] to-[#D73742] hover:opacity-90 shadow-sm">
                            Create SKU
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isEditModalOpen && !!editSku}
                onClose={() => {
                    setIsEditModalOpen(false)
                    setEditSku(null)
                    resetForm()
                }}
                title="Edit SKU"
            >
                {editSku && (
                    <form
                        className="space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault()
                            const payload = validateAndBuildPayload(form)
                            if (!payload) return
                            setSkus((prev) =>
                                prev.map((s) => (s.id === editSku.id ? { ...s, ...payload } : s))
                            )
                            showToast("success", "SKU updated successfully")
                            setIsEditModalOpen(false)
                            setEditSku(null)
                            resetForm()
                        }}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="mb-1" htmlFor="edit_brand_name">Brand Name</Label>
                                <Input
                                    id="edit_brand_name"
                                    value={form.brand_name}
                                    onChange={(e) => handleFormChange("brand_name", e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label className="mb-1" htmlFor="edit_product_name">Product Name</Label>
                                <Input
                                    id="edit_product_name"
                                    value={form.product_name}
                                    onChange={(e) => handleFormChange("product_name", e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label className="mb-1" htmlFor="edit_brand_code">Brand Code</Label>
                                <Input
                                    id="edit_brand_code"
                                    value={form.brand_code}
                                    onChange={(e) => handleFormChange("brand_code", e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label className="mb-1" htmlFor="edit_category">Category</Label>
                                <Select value={form.category} onValueChange={(value) => handleFormChange("category", value)}>
                                    <SelectTrigger id="edit_category" className="w-full">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORY_OPTIONS.map((item) => (
                                            <SelectItem key={item} value={item}>
                                                {item}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="mb-1" htmlFor="edit_size_ml">Size (ml)</Label>
                                <Input
                                    id="edit_size_ml"
                                    value={form.size_ml}
                                    onChange={(e) => handleFormChange("size_ml", e.target.value)}
                                    inputMode="numeric"
                                    required
                                    type="number"
                                />
                            </div>
                            <div>
                                <Label className="mb-1" htmlFor="edit_mrp">MRP</Label>
                                <Input
                                    id="edit_mrp"
                                    value={form.mrp}
                                    onChange={(e) => handleFormChange("mrp", e.target.value)}
                                    inputMode="decimal"
                                    required
                                    type="number"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-dashed border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditModalOpen(false)
                                    setEditSku(null)
                                    resetForm()
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-linear-to-b from-[#FF4250] to-[#D73742] hover:opacity-90 shadow-sm">
                                Save Changes
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            <Modal
                isOpen={isDeleteModalOpen && !!deleteSkuState}
                onClose={() => {
                    setIsDeleteModalOpen(false)
                    setDeleteSkuState(null)
                }}
                title="Delete SKU"
            >
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">{deleteSkuState?.name || "this SKU"}</span>?
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsDeleteModalOpen(false)
                                setDeleteSkuState(null)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={!deleteSkuState?.id}
                            onClick={() => {
                                if (!deleteSkuState?.id) return
                                setSkus((prev) => prev.filter((s) => s.id !== deleteSkuState.id))
                                showToast("success", "SKU deleted successfully")
                                setIsDeleteModalOpen(false)
                                setDeleteSkuState(null)
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </main>
    )
}

export default AddSkus