"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Store, Search, Edit2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { DUMMY_SHOPS } from "@/lib/constants/dummyData";
import { useDebounced } from "@/hooks/useDebounce";
import { showToast } from "@/components/ui/toast";

interface FormState {
    shop_name: string;
    original_dp_code: string;
    state: string;
    district: string;
    vendor_code: string;
    address: string;
    contact_info: string;
    alternate_names: string;
    is_active: boolean;
}

const initialFormState: FormState = {
    shop_name: "",
    original_dp_code: "",
    state: "",
    district: "",
    vendor_code: "",
    address: "",
    contact_info: "",
    alternate_names: "",
    is_active: true,
};

const ALLOWED_DP_CODES = ["DCCWS", "DSCSC", "DSIIDC", "DTTDC"] as const;
const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
const ROW_HEIGHT = 56;
const ROW_OVERSCAN = 6;

const AddNewShop = () => {
    const [shops, setShops] = useState<any[]>([...DUMMY_SHOPS]);
    const [form, setForm] = useState<FormState>(initialFormState);
    const [search, setSearch] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editShop, setEditShop] = useState<{
        id: string;
        shop_name: string;
        original_dp_code: string;
        state: string;
        district: string;
        address: string;
        contact_info: string;
        alternate_names: string;
    } | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [deleteShop, setDeleteShop] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [scrollTop, setScrollTop] = useState(0);
    const [viewportHeight, setViewportHeight] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const debouncedSearch = useDebounced(search, 300);

    const filteredShops = useMemo(() => {
        const keyword = debouncedSearch.trim().toLowerCase();
        if (!keyword) return shops;
        return shops.filter((shop) => {
            const name = shop.shop_name?.toLowerCase() ?? "";
            const dp = shop.original_dp_code?.toLowerCase() ?? "";
            const state = shop.state?.toLowerCase() ?? "";
            const district = shop.district?.toLowerCase() ?? "";
            return (
                name.includes(keyword) ||
                dp.includes(keyword) ||
                state.includes(keyword) ||
                district.includes(keyword)
            );
        });
    }, [shops, debouncedSearch]);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        const updateHeight = () => setViewportHeight(el.clientHeight);
        updateHeight();

        const observer = new ResizeObserver(updateHeight);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const totalRows = filteredShops.length;
    const visibleRowCount = Math.max(1, Math.ceil(viewportHeight / ROW_HEIGHT));
    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - ROW_OVERSCAN);
    const endIndex = Math.min(
        totalRows,
        startIndex + visibleRowCount + ROW_OVERSCAN * 2
    );
    const virtualRows = filteredShops.slice(startIndex, endIndex);
    const topSpacerHeight = startIndex * ROW_HEIGHT;
    const bottomSpacerHeight = Math.max(0, (totalRows - endIndex) * ROW_HEIGHT);

    const handleChange = (field: keyof FormState, value: string | boolean) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();

        const shopName = form.shop_name.trim();
        const rawDpCode = form.original_dp_code.trim().toUpperCase();
        const phone = form.contact_info.trim();

        if (!shopName || !rawDpCode) {
            showToast("error", "Shop name and DP code are required");
            return;
        }

        // Basic Indian mobile number validation (10 digits, starts with 6-9)
        if (!INDIAN_MOBILE_REGEX.test(phone)) {
            showToast("error", "Please enter a valid 10-digit Indian mobile number");
            return;
        }

        if (!ALLOWED_DP_CODES.includes(rawDpCode as (typeof ALLOWED_DP_CODES)[number])) {
            showToast(
                "error",
                `Invalid DP code selected. Allowed values: ${ALLOWED_DP_CODES.join(
                    ", "
                )}`
            );
            return;
        }

        const newShop = {
            id: `shop-${Date.now()}`,
            shop_name: shopName,
            name: shopName,
            original_dp_code: rawDpCode,
            dp_code: rawDpCode,
            state: form.state.trim() || "Delhi",
            district: form.district.trim() || "Central Delhi",
            vendor_code: form.vendor_code.trim() || `VEND-${Math.floor(100 + Math.random() * 900)}`,
            address: form.address.trim() || "New Delhi",
            contact_info: form.contact_info.trim() || "+91 98765 43210",
            is_active: form.is_active,
            alternate_names: form.alternate_names,
        };

        setShops((prev) => [newShop, ...prev]);
        showToast("success", "Shop created successfully");
        setForm(initialFormState);
        setIsAddModalOpen(false);
    };

    return (
        <main className="min-h-screen py-4 sm:py-2">
            <div className="w-full space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-linear-to-b from-[#FF4250] to-[#D73742] p-2 text-white shadow-sm">
                            <Store className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-semibold leading-6 text-charcoal-black">
                                Shop Management
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                View all shops and add new shops using DP code.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 shadow-sm w-full sm:w-auto"
                    >
                        <Plus className="w-4 h-4" />
                        Add Shop
                    </Button>
                </div>

                {/* List card */}
                <Card className="bg-white border border-[rgba(0,0,0,0.1)] rounded-2xl p-4 space-y-4">
                    <div className="flex flex-col lg:flex-row justify-between gap-3 items-start lg:items-center">
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold text-[#000000]">
                                Shops
                            </h2>
                            <p className="text-xs sm:text-sm text-placeholder-gray">
                                Total {filteredShops.length} records
                            </p>
                        </div>

                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-placeholder-gray" />
                            <Input
                                placeholder="Search by dp code, name, state..."
                                value={search}
                                maxLength={40}
                                autoFocus
                                onChange={(e) => setSearch(e.target.value)}
                                onBlur={() => setSearch((prev) => prev.trimStart())}
                                className="w-full h-10 pl-10 pr-3 border border-[#E5E5E5] rounded-lg text-sm text-sidebar-foreground focus:ring-0 focus:border-[#E5E5E5]"
                            />
                        </div>
                    </div>

                    <div className="border border-[#E5E5E5] rounded-lg overflow-hidden">
                        <div
                            ref={scrollContainerRef}
                            className="max-h-[70vh] overflow-y-auto"
                            onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
                        >
                            <Table className="w-full table-fixed">
                                <TableHeader className="sticky top-0 z-10 bg-tertiary-color">
                                    <TableRow className="h-10 border-b border-[#E5E5E5]">
                                        <TableHead className="w-[140px] text-sm font-medium text-placeholder-gray">
                                            DP Code
                                        </TableHead>
                                        <TableHead className="w-[220px] text-sm font-medium text-placeholder-gray">
                                            Shop Name
                                        </TableHead>
                                        <TableHead className="w-[160px] text-sm font-medium text-placeholder-gray">
                                            State
                                        </TableHead>
                                        <TableHead className="w-[120px] text-sm font-medium text-placeholder-gray">
                                            Status
                                        </TableHead>
                                        <TableHead className="w-[110px] text-sm font-medium text-placeholder-gray text-center">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {false ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-20 text-center text-sm text-placeholder-gray"
                                            >
                                                Loading shops...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredShops.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-20 text-center text-sm text-placeholder-gray"
                                            >
                                                No shops found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <>
                                            {topSpacerHeight > 0 && (
                                                <TableRow aria-hidden="true">
                                                    <TableCell
                                                        colSpan={5}
                                                        className="p-0 border-0"
                                                        style={{ height: `${topSpacerHeight}px` }}
                                                    />
                                                </TableRow>
                                            )}
                                            {virtualRows.map((shop, index) => (
                                            <TableRow
                                                key={shop.id}
                                                className={`h-[56px] border-b border-[#E5E5E5] ${(startIndex + index) % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"
                                                    }`}
                                            >
                                                <TableCell className="w-[140px] text-sm font-medium text-sidebar-foreground">
                                                    {shop.original_dp_code}
                                                </TableCell>
                                                <TableCell className="w-[220px] text-sm text-sidebar-foreground truncate">
                                                    {shop.shop_name || "-"}
                                                </TableCell>
                                                <TableCell className="w-[160px] text-sm text-sidebar-foreground">
                                                    {shop.state || "-"}
                                                </TableCell>

                                                <TableCell className="w-[120px]">
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            className="cursor-pointer"
                                                            id={`shop-status-${shop.id}`}
                                                            checked={shop.is_active}
                                                            onCheckedChange={(checked) => {
                                                                setShops((prev) =>
                                                                    prev.map((s) =>
                                                                        s.id === shop.id ? { ...s, is_active: checked } : s
                                                                    )
                                                                );
                                                                showToast(
                                                                    "success",
                                                                    `Shop marked as ${checked ? "active" : "inactive"}`
                                                                );
                                                            }}
                                                        />
                                                        <span className="text-xs font-medium">
                                                            {shop.is_active ? "Active" : "Inactive"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="w-[110px]">
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 px-2 text-xs"
                                                            onClick={() => {
                                                                setEditShop({
                                                                    id: shop.id,
                                                                    shop_name: shop.shop_name,
                                                                    original_dp_code: shop.original_dp_code,
                                                                    state: shop.state,
                                                                    district: shop.district,
                                                                    address: shop.address ?? "",
                                                                    contact_info: shop.contact_info ?? "",
                                                                    alternate_names: Array.isArray(shop.alternate_names)
                                                                        ? shop.alternate_names.join(", ")
                                                                        : (shop.alternate_names ?? ""),
                                                                });
                                                                setIsEditModalOpen(true);
                                                            }}
                                                        >
                                                            <Edit2 className="w-3 h-3 mr-1" />

                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 px-2 text-xs border-red-200 text-red-600 hover:bg-red-50"
                                                            onClick={() => {
                                                                setDeleteShop({
                                                                    id: shop.id,
                                                                    name: shop.shop_name,
                                                                });
                                                                setIsDeleteModalOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="w-3 h-3 mr-1" />

                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            ))}
                                            {bottomSpacerHeight > 0 && (
                                                <TableRow aria-hidden="true">
                                                    <TableCell
                                                        colSpan={5}
                                                        className="p-0 border-0"
                                                        style={{ height: `${bottomSpacerHeight}px` }}
                                                    />
                                                </TableRow>
                                            )}
                                        </>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </Card>

                {/* (Preview by dp code removed for now, since creation payload is product-based) */}
            </div>

            {/* Add Shop Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Shop"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-1" htmlFor="shop_name">Shop Name</Label>
                            <Input
                                id="shop_name"
                                value={form.shop_name}
                                onChange={(e) => handleChange("shop_name", e.target.value)}
                                placeholder="Dharampuri"
                                required
                                minLength={3}
                                maxLength={80}
                            />
                        </div>

                        <div>
                            <Label className="mb-1" htmlFor="original_dp_code">DP Code</Label>
                            <Select
                                value={form.original_dp_code}
                                onValueChange={(value) =>
                                    handleChange("original_dp_code", value)
                                }
                                required
                            >
                                <SelectTrigger id="original_dp_code" className="w-full">
                                    <SelectValue placeholder="Select DP Code" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ALLOWED_DP_CODES.map((code) => (
                                        <SelectItem key={code} value={code}>
                                            {code}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="mb-1" htmlFor="state">State</Label>
                            <Input
                                id="state"
                                value={form.state}
                                onChange={(e) => handleChange("state", e.target.value)}
                                placeholder="Delhi"
                                minLength={2}
                                maxLength={50}
                            />
                        </div>

                        <div>
                            <Label className="mb-1" htmlFor="district">District</Label>
                            <Input
                                id="district"
                                value={form.district}
                                onChange={(e) => handleChange("district", e.target.value)}
                                placeholder="Los Angeles"
                                minLength={2}
                                maxLength={50}
                            />
                        </div>

                        <div>
                            <Label className="mb-1" htmlFor="vendor_code">Vendor Code</Label>
                            <Input
                                id="vendor_code"
                                value={form.vendor_code}
                                onChange={(e) =>
                                    handleChange("vendor_code", e.target.value)
                                }
                                placeholder="VENDOR123"
                                maxLength={30}
                            />
                        </div>

                        <div>
                            <Label className="mb-1" htmlFor="contact_info">Contact Info</Label>
                            <Input
                                id="contact_info"
                                value={form.contact_info}
                                onChange={(e) => {
                                    const digitsOnly = e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 10);
                                    handleChange("contact_info", digitsOnly);
                                }}
                                placeholder="9876543210"
                                maxLength={10}
                                minLength={10}
                                inputMode="numeric"
                                pattern="^[6-9]\d{9}$"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="mb-1" htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            value={form.address}
                            onChange={(e) => handleChange("address", e.target.value)}
                            placeholder="123 Main Street, Los Angeles, CA"
                            maxLength={200}
                        />
                    </div>

                    <div>
                        <Label className="mb-1" htmlFor="alternate_names">Alternate Names (comma separated)</Label>
                        <Input
                            id="alternate_names"
                            value={form.alternate_names}
                            onChange={(e) =>
                                handleChange("alternate_names", e.target.value)
                            }
                            placeholder="Test Store, Main Branch"
                            maxLength={200}
                        />
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-dashed border-gray-200">


                        <Button
                            type="submit"
                            disabled={false}
                            className="inline-flex items-center gap-2 bg-linear-to-b from-[#FF4250] to-[#D73742] hover:opacity-90 shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Create Shop
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Shop Modal */}
            <Modal
                isOpen={isEditModalOpen && !!editShop}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditShop(null);
                }}
                title="Edit Shop"
            >
                {editShop && (
                    <form
                        className="space-y-4"
                        onSubmit={async (e) => {
                            e.preventDefault();

                            try {
                                const phone = editShop.contact_info.trim();
                                if (!INDIAN_MOBILE_REGEX.test(phone)) {
                                    showToast(
                                        "error",
                                        "Please enter a valid 10-digit Indian mobile number"
                                    );
                                    return;
                                }


                                setShops((prev) =>
                                    prev.map((s) =>
                                        s.id === editShop.id
                                            ? {
                                                  ...s,
                                                  shop_name: editShop.shop_name,
                                                  name: editShop.shop_name,
                                                  original_dp_code: editShop.original_dp_code,
                                                  dp_code: editShop.original_dp_code,
                                                  state: editShop.state,
                                                  district: editShop.district,
                                                  address: editShop.address.trim(),
                                                  contact_info: phone,
                                                  alternate_names: editShop.alternate_names,
                                              }
                                            : s
                                    )
                                );
                                showToast("success", "Shop updated successfully");
                                setIsEditModalOpen(false);
                                setEditShop(null);
                            } catch (error: any) {
                                const message =
                                    error?.response?.data?.message ||
                                    "Failed to update shop";
                                showToast("error", message);
                            }
                        }}
                    >
                        <div className="space-y-3">
                            <div>
                                <Label className="mb-1" htmlFor="edit_shop_name">Shop Name</Label>
                                <Input
                                    id="edit_shop_name"
                                    value={editShop.shop_name}
                                    onChange={(e) =>
                                        setEditShop((prev) =>
                                            prev
                                                ? { ...prev, shop_name: e.target.value }
                                                : prev
                                        )
                                    }
                                    placeholder="Enter shop name"
                                    required
                                    minLength={3}
                                    maxLength={80}
                                />
                            </div>

                            <div>
                                <Label className="mb-1" htmlFor="edit_dp_code">DP Code</Label>
                                <Input
                                    id="edit_dp_code"
                                    value={editShop.original_dp_code}
                                    onChange={(e) =>
                                        setEditShop((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    original_dp_code: e.target.value,
                                                }
                                                : prev
                                        )
                                    }
                                    placeholder="Enter DP code"
                                    required
                                    minLength={3}
                                    maxLength={10}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label className="mb-1" htmlFor="edit_state">State</Label>
                                    <Input
                                        id="edit_state"
                                        value={editShop.state}
                                        onChange={(e) =>
                                            setEditShop((prev) =>
                                                prev
                                                    ? { ...prev, state: e.target.value }
                                                    : prev
                                            )
                                        }
                                        placeholder="Enter state"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="mb-1" htmlFor="edit_district">District</Label>
                                    <Input
                                        id="edit_district"
                                        value={editShop.district}
                                        onChange={(e) =>
                                            setEditShop((prev) =>
                                                prev
                                                    ? {
                                                        ...prev,
                                                        district: e.target.value,
                                                    }
                                                    : prev
                                            )
                                        }
                                        placeholder="Enter district"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label className="mb-1" htmlFor="edit_contact_info">Contact Info</Label>
                                    <Input
                                        id="edit_contact_info"
                                        value={editShop.contact_info}
                                        onChange={(e) =>
                                            setEditShop((prev) =>
                                                prev
                                                    ? {
                                                        ...prev,
                                                        contact_info: e.target.value
                                                            .replace(/\D/g, "")
                                                            .slice(0, 10),
                                                    }
                                                    : prev
                                            )
                                        }
                                        placeholder="9876543210"
                                        maxLength={10}
                                        minLength={10}
                                        inputMode="numeric"
                                        pattern="^[6-9]\d{9}$"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="mb-1" htmlFor="edit_address">Address</Label>
                                <Input
                                    id="edit_address"
                                    value={editShop.address}
                                    onChange={(e) =>
                                        setEditShop((prev) =>
                                            prev
                                                ? { ...prev, address: e.target.value }
                                                : prev
                                        )
                                    }
                                    placeholder="Enter address"
                                    maxLength={200}
                                />
                            </div>

                            <div>
                                <Label className="mb-1" htmlFor="edit_alternate_names">Alternate Names (comma separated)</Label>
                                <Input
                                    id="edit_alternate_names"
                                    value={editShop.alternate_names}
                                    onChange={(e) =>
                                        setEditShop((prev) =>
                                            prev
                                                ? { ...prev, alternate_names: e.target.value }
                                                : prev
                                        )
                                    }
                                    placeholder="Test Store, Main Branch"
                                    maxLength={200}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-dashed border-gray-200 mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setEditShop(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-linear-to-b from-[#FF4250] to-[#D73742] hover:opacity-90 shadow-sm"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Delete Shop Modal */}
            <Modal
                isOpen={isDeleteModalOpen && !!deleteShop}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteShop(null);
                }}
                title="Delete Shop"
            >
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">
                            {deleteShop?.name || "this shop"}
                        </span>
                        ? This action cannot be undone.
                    </p>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsDeleteModalOpen(false);
                                setDeleteShop(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                if (!deleteShop?.id) return;
                                setShops((prev) => prev.filter((s) => s.id !== deleteShop.id));
                                showToast("success", "Shop deleted successfully");
                                setIsDeleteModalOpen(false);
                                setDeleteShop(null);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </main>
    );
};

export default AddNewShop;