"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "../ui/button";
import { Store, Hash, CheckCircle2, Search, X, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useGetAssignedShopsDetailById, useAssignShopToUser, useUnassignShopFromUser } from "@/hooks/api/useShopSalesMaping";
import { showToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import Image from "next/image";
type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;

};

export function ShopUsersTable({
  users = [],
  title = "Users",
  salesPerson = "",
}: {
  users?: User[];
  title?: string;
  salesPerson: string;
}) {

  const [selected, setSelected] = useState<string[]>([]);
  const [viewShopsSheet, setViewShopsSheet] = useState(false);
  const [assignedShopDetail, setAssignedShopDetail] = useState<{ userId: string, shops: any[], pagination: any }>({ userId: "", shops: [], pagination: null });
  const [loading, setLoading] = useState(false);
  const [searchShop, setSearchShop] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const itemsPerPage = 30;

  const getShopsMutation = useGetAssignedShopsDetailById();

  const fetchShops = (id: string, searchTerm: string, page: number) => {
    setLoading(true);
    const offset = (page - 1) * itemsPerPage;

    getShopsMutation.mutate({ id, search: searchTerm, limit: itemsPerPage, offset }, {
      onSuccess: (data) => {

        setLoading(false);
        const uniqueShops = data?.data?.shops?.filter((shop: any, index: number, self: any[]) =>
          index === self.findIndex((s: any) => s.id === shop.id)
        ) || [];

        setAssignedShopDetail({
          userId: data?.data?.user_id,
          shops: uniqueShops,
          pagination: data?.data?.pagination || null
        });
      },
      onError: (error) => {
        setLoading(false);
      }
    });
  };

  const handleViewShops = (id: string) => {
    setCurrentUserId(id);
    setCurrentPage(1);
    setSearchShop("");
    fetchShops(id, "", 1);
  };




  return (
    <div className="w-full">
      <div className="font-inter bg-white border border-[rgba(0,0,0,0.1)] rounded-2xl p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-[#000000]">{title}</h2>
          <div className="text-sm text-placeholder-gray">
            {users.length} record{users.length === 1 ? "" : "s"}
          </div>
        </div>

        {/* Table */}
        <div className="border border-[#E5E5E5] rounded-lg overflow-hidden">
          <div className="overflow-x-auto scrollbar-custom">
            <div className="min-w-[600px]">
              {/* Table Header */}
              <div className="bg-tertiary-color border-b border-[#E5E5E5]">
                <Table>
                  <TableHeader>
                    <TableRow className="h-10">

                      <TableHead className="min-w-[200px] text-sm font-medium text-placeholder-gray">
                        First Name
                      </TableHead>
                      <TableHead className="min-w-[200px] text-sm font-medium text-placeholder-gray">
                        Last Name
                      </TableHead>
                      <TableHead className="min-w-[350px] text-sm font-medium text-placeholder-gray">
                        Email
                      </TableHead>
                      <TableHead className="min-w-[200px] text-sm font-medium text-placeholder-gray">Shop Detail</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
              </div>

              {/* Table Body (scrollable with max height) */}
              <div className="max-h-[80vh] overflow-y-auto">
                <Table>
                  <TableBody>
                    {users.map((u, idx) => (
                      <TableRow
                        key={u.id}
                        className={`h-[60px] border-b border-[#E5E5E5] ${idx % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"
                          }`}
                      >

                        <TableCell className="min-w-[200px]">
                          <span className="text-sm text-sidebar-foreground">
                            {u.first_name || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="min-w-[200px]">
                          <span className="text-sm text-sidebar-foreground">
                            {u.last_name || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="min-w-[350px]">
                          <span className="text-sm text-sidebar-foreground">
                            {u.email || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="min-w-[200px]">
                          <div className="flex justify-start">
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button variant="default" onClick={() => handleViewShops(u.id)} disabled={viewShopsSheet}>View Shops</Button>
                              </SheetTrigger>
                              <ViewShopsSheet
                                assignedShopDetail={assignedShopDetail}
                                title="Assigned Shops"
                                loading={loading}
                                setSearchShop={setSearchShop}
                                searchShop={searchShop}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                fetchShops={fetchShops}
                                currentUserId={currentUserId}
                                itemsPerPage={itemsPerPage}
                              />
                            </Sheet>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-[60px] text-center text-sm text-placeholder-gray">
                          No users found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ViewShopsSheet({
  assignedShopDetail,
  title,
  loading,
  setSearchShop,
  searchShop,
  currentPage,
  setCurrentPage,
  fetchShops,
  currentUserId,
  itemsPerPage
}: {
  assignedShopDetail: { userId: string; shops: any[], pagination: any };
  title: string;
  loading: boolean;
  setSearchShop?: (searchShop: string) => void;
  searchShop?: string;
  currentPage?: number;
  setCurrentPage?: React.Dispatch<React.SetStateAction<number>>;
  fetchShops: (id: string, searchTerm: string, page: number) => void;
  currentUserId: string;
  itemsPerPage: number;
}) {
  const { userId, shops, pagination } = assignedShopDetail;
  const [selectedShops, setSelectedShops] = useState<Set<string>>(new Set());
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    shop: any | null;
    isAssigning: boolean;
  }>({
    isOpen: false,
    shop: null,
    isAssigning: false,
  });

  const totalShops = pagination?.with_filters || 0;
  const totalPages = Math.ceil(totalShops / itemsPerPage);
  const startItem = totalShops === 0 ? 0 : ((currentPage || 1) - 1) * itemsPerPage + 1;
  const endItem = Math.min((currentPage || 1) * itemsPerPage, totalShops);
  const assignShop = useAssignShopToUser();
  const unassignShop = useUnassignShopFromUser();
  const isMutating = assignShop.isPending || unassignShop.isPending;

  const handleToggleShop = (shop: any) => {
    if (!currentUserId || isMutating) return;

    // Always show confirmation modal for both assign and unassign
    setConfirmationModal({
      isOpen: true,
      shop: shop,
      isAssigning: !shop.shop_assigned, // true if assigning, false if unassigning
    });
  };

  const performShopToggle = (shop: any) => {
    const vars = { userId: currentUserId, shopId: shop.id };
    const doMutate = shop.shop_assigned ? unassignShop.mutate : assignShop.mutate;

    doMutate(vars, {
      onSuccess: () => {
        showToast("success", shop.shop_assigned ? "Shop unassigned" : "Shop assigned");
        // refresh current page with current filters
        fetchShops(currentUserId, searchShop || "", currentPage || 1);
        setConfirmationModal({ isOpen: false, shop: null, isAssigning: false });
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || "Operation failed";
        showToast("error", msg);
        setConfirmationModal({ isOpen: false, shop: null, isAssigning: false });
      },
    });
  };

  const handleConfirmToggle = () => {
    if (confirmationModal.shop) {
      performShopToggle(confirmationModal.shop);
    }
  };

  const handleCancelToggle = () => {
    setConfirmationModal({ isOpen: false, shop: null, isAssigning: false });
  };


  const handlePreviousPage = () => {
    if (currentPage && currentPage > 1 && setCurrentPage) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchShops(currentUserId, searchShop || "", newPage);
    }
  };

  const handleNextPage = () => {
    if (currentPage && currentPage < totalPages && setCurrentPage) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchShops(currentUserId, searchShop || "", newPage);
    }
  };

  // Effect to handle search changes
  useEffect(() => {
    if (searchShop !== undefined && currentUserId && setCurrentPage) {
      const timer = setTimeout(() => {
        setCurrentPage(1);
        fetchShops(currentUserId, searchShop, 1);
      }, 500); // Debounce search

      return () => clearTimeout(timer);
    }
  }, [searchShop]);

  return (
    <SheetContent key={userId} className="font-inter px-2 flex flex-col" maxWidth="lg">
      <SheetHeader className='border-b border-gray-200 pb-2'>
        <SheetTitle className="flex items-center gap-2">
          <Image src="/svg/Store.svg" alt="shop" width={20} height={20} />
          <span className="text-sm font-medium text-gray-700">
            {title === "All" ? "All Shops" : "Allocated Shops"}
          </span>
        </SheetTitle>
        <SheetDescription>
          {title === "All" ? "View and manage all shops" : "View and manage assigned shops"}
        </SheetDescription>
      </SheetHeader>

      <div className="py-2 px-3 bg-secondary rounded-lg flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Total Shops</span>
        <span className="text-lg font-semibold text-primary">{totalShops}</span>
      </div>

      {selectedShops.size > 0 && (
        <div className=" py-1.5 px-3 bg-green-50 rounded-lg">
          <span className="text-sm text-green-700">
            {selectedShops.size} selected
          </span>
        </div>
      )}

      <div className="relative w-full  ">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
        <Input
          type="text"
          placeholder="Search Shops"
          value={searchShop}
          onChange={(e) => setSearchShop?.(e.target.value)}
          className="w-full h-10 pl-10 pr-14 rounded-md border border-primary placeholder:text-primary text-sm text-primary focus:outline-none focus:ring-1 focus:ring-secondary"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[11px] text-gray-400 border border-primary px-1.5 py-0.5 rounded">
          <span className="font-medium text-primary">⌘</span>
          <span className="text-primary">K</span>
        </div>
      </div>

      {/* Shops List - Fixed Height */}
      <div className="max-h-[40vh]  lg:mt-4 flex-1  overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-gray-500">Loading shops...</div>
          </div>
        ) : (
          <div className="space-y-2 pb-4">
            {shops && shops.map((shop: any, index: number) => {
              const isSelected = selectedShops.has(shop.id);
              const globalIndex = startItem + index;
              return (
                <div
                  key={shop.id}
                  onClick={() => handleToggleShop(shop)}
                  className={`relative p-3 rounded-lg w-full overflow-hidden border cursor-pointer transition-all ${isSelected
                    ? 'border-blue-500 bg-secondary'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <div className="absolute top-3 right-3">
                    <div className="w-4 h-4 rounded border border-gray-200 flex items-center justify-center">
                      {shop.shop_assigned ? (
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      ) : (
                        <X className="w-3 h-3 text-red-500 cursor-pointer" />
                      )}
                    </div>
                  </div>

                  <div className="pr-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">
                        {globalIndex}
                      </div>
                      <Store className="w-3.5 h-3.5 text-gray-400" />
                    </div>

                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      {shop.shop_name}
                    </h4>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Hash className="w-3 h-3" />
                      <span>{shop.dp_code}/{shop.vendor_code}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {(!shops || shops.length === 0) && (
              <div className="py-12 text-center">
                <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900">No Shops Found</p>
                <p className="text-xs text-gray-500 mt-1">
                  {searchShop ? "Try a different search term" : "This user has no shops assigned"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination - Fixed at Bottom */}


      <SheetFooter className="pt-0 lg:pt-4 border-t border-gray-200">
        {totalPages > 1 && !loading && (
          <div className="mt-auto pt-4 pb-2 ">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{startItem}</span> to{" "}
                <span className="font-medium">{endItem}</span> of{" "}
                <span className="font-medium">{totalShops}</span> shops
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || loading}
            className="h-8 w-8 p-0 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || loading}
            className="h-8 w-8 p-0 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {/* <Button
          type="submit"
          disabled={selectedShops.size === 0}
        >
          Save {selectedShops.size > 0 && `(${selectedShops.size})`}
        </Button> */}
        <SheetClose asChild>
          <Button variant="outline">Close</Button>
        </SheetClose>
      </SheetFooter>

      {/* Confirmation Modal */}
      <Dialog open={confirmationModal.isOpen} onOpenChange={(open) => !open && handleCancelToggle()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${confirmationModal.isAssigning
                ? (confirmationModal.shop?.assigned_to_other
                  ? 'bg-orange-100'
                  : 'bg-green-100')
                : 'bg-red-100'
                }`}>
                <AlertTriangle className={`w-5 h-5 ${confirmationModal.isAssigning
                  ? (confirmationModal.shop?.assigned_to_other
                    ? 'text-orange-600'
                    : 'text-green-600')
                  : 'text-red-600'
                  }`} />
              </div>
              <DialogTitle className="text-lg font-semibold">
                {confirmationModal.isAssigning ? "Confirm Shop Assignment" : "Confirm Shop Unassignment"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-gray-600 pt-2">
              {confirmationModal.isAssigning ? (
                <>
                  {confirmationModal.shop?.assigned_to_other && (
                    <p className="font-medium text-orange-600 mb-2">
                      Are you sure you want to unassign this shop?
                    </p>
                  )}
                  <p className="mt-2">
                    {confirmationModal.shop?.assigned_to_other
                      ? "Are you sure you want to unassign this shop?"
                      : "Do you want to assign this shop to the current user?"
                    }
                  </p>
                  <p>
                    Shop: <span className="font-semibold text-gray-900">{confirmationModal.shop?.shop_name}</span>
                  </p>

                </>
              ) : (
                <>
                  <p>
                    Are you sure you want to unassign this shop?<br className="mt-1" />Shop Name:{" "}
                    <span className="font-semibold text-gray-900">{confirmationModal.shop?.shop_name}</span>
                  </p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancelToggle}
              disabled={isMutating}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmToggle}
              disabled={isMutating}
              className={`cursor-pointer ${confirmationModal.isAssigning
                ? (confirmationModal.shop?.assigned_to_other
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-green-600 hover:bg-green-700')
                : 'bg-red-600 hover:bg-red-700'
                }`}
            >
              {isMutating ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SheetContent>
  );
}
