"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  RefreshCw,
  ChevronRight,
  X,
  Edit,
  Save,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSellerProfileDirect } from "@/hooks/api/useSellerProfileDirect";
import { useSellerExportData } from "@/hooks/api/useSeller";
import { Skeleton } from "@/components/ui/skeleton";
import { ShopCard } from "@/components/sellercomponents/profile/shopCard";
import { useAuth } from "@/contexts/AuthContext";
import { showToast } from "@/components/ui/toast";
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
  Table,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteCookie } from "cookies-next";
import { Textarea } from "@/components/ui/textarea";
import { formatLastVisitDate } from "@/utils/formatLastVisitDate";
import {
  useStaffPanelShopDetail,
  useUpdateStaffData,
} from "@/hooks/api/useAllShops";
import { AuthClientService } from "@/lib/services";
import { formatDateToDDMMYYYY } from "@/utils/formatDateDDMMYYY";

interface CompleteSellerProfileProps {
  userName?: string;
  userInitials?: string;
}

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  shopId?: string;
  onEditClick: (row: any, shopId: string) => void;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onSave: (updatedData: any) => void;
}

const categories = ["Beer Bottles", "Whiskey", "Vodka"];

// Error message component
const ErrorMessage = ({ message }: { message: string }) => (
  <p className="text-xs text-red-600 mt-1">{message}</p>
);

function StockModal({
  isOpen,
  onClose,
  data,
  shopId,
  onEditClick,
}: StockModalProps) {
  const [selectedCategory, setSelectedCategory] = useState("Beer Bottles");

  // Filter data based on selected category
  const filteredData = useMemo(() => {
    if (!isOpen || !data?.rows) return [];
    // This is a mock filter - you'll need to adjust based on your actual data structure
    return data.rows.filter((row: any) => {
      // Adjust this logic based on how your data categorizes products
      if (selectedCategory === "Beer Bottles") {
        return row.category === "BEER";
      } else if (selectedCategory === "Whiskey") {
        return row.category === "WHISKY";
      } else if (selectedCategory === "Vodka") {
        return row.category === "VODKA";
      }
      return true;
    });
  }, [data, selectedCategory]);

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-modal-backdrop"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="fixed max-w-2xl mx-auto inset-x-0 bottom-10 z-50">
        <div className="bg-white rounded-t-2xl w-full max-h-[80vh] flex flex-col animate-modal-slide-up shadow-2xl">
          {/* Drag Handle */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
          </div>

          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h2 className="font-inter text-lg font-semibold text-black">
              Updated Stock
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 p-4 border-b border-gray-100">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full cursor-pointer text-sm font-medium transition-colors duration-200 ${selectedCategory === category
                  ? "bg-black text-white border-2 border-black"
                  : "bg-gray-100 text-gray-600 border-2 border-transparent"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto overflow-y-auto px-4">
            <div className="min-w-[400px]">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="text-gray-600 font-medium text-sm min-w-[120px] pl-6">
                      Segment
                    </TableHead>
                    <TableHead className="text-gray-600 font-medium text-sm min-w-[85px]">
                      Size
                    </TableHead>
                    <TableHead className="text-gray-600 font-medium text-sm min-w-[85px]">
                      Demand
                    </TableHead>
                    <TableHead className="text-gray-600 font-medium text-sm min-w-[85px]">
                      Closing
                    </TableHead>
                    <TableHead className="text-gray-600 font-medium text-sm min-w-[85px]">
                      Breakage
                    </TableHead>
                    <TableHead className="text-gray-600 font-medium text-sm min-w-[85px]">
                      Edit
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((row: any, index: number) => (
                    <TableRow key={index} className="border-b border-gray-100">
                      <TableCell className="text-red-600 font-medium text-sm pl-6">
                        {row.segment || "N/A"}
                      </TableCell>
                      <TableCell className="text-black text-sm">
                        {row.size || "N/A"}
                      </TableCell>
                      <TableCell className="text-black text-sm">
                        {row.demand || "0"}
                      </TableCell>
                      <TableCell className="text-black text-sm">
                        {row.closing || "0"}
                      </TableCell>
                      <TableCell className="text-black text-sm">
                        {row.breakage || "0"}
                      </TableCell>

                      <TableCell>
                        <Edit
                          aria-label="Edit"
                          role="button"
                          onClick={() => onEditClick(row, shopId || "")}
                          className="w-4 h-4 cursor-pointer hover:text-primary transition-colors"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredData.length === 0 && (
                <div className="text-left py-8 text-gray-500">
                  <p>No data available for {selectedCategory}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 flex flex-row gap-2 items-center">
            <p className="font-inter text-sm font-semibold text-gray-900">
              Reported Date :
            </p>
            <p className="font-inter text-sm text-gray-500">
              {data.meta?.reportDate.split("-").reverse().join("/")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function EditModal({ isOpen, onClose, data, onSave }: EditModalProps) {
  const [formData, setFormData] = useState({
    demand: "",
    closing: "",
    breakage: "",
    notes: "",
  });
  const [errors, setErrors] = useState({
    demand: "",
    closing: "",
    breakage: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    demand: false,
    closing: false,
    breakage: false,
  });

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && data) {
      setFormData({
        demand:
          data.demand != null && data.demand !== ""
            ? String(Math.max(0, Math.floor(Number(data.demand))))
            : "0",
        closing:
          data.closing != null && data.closing !== ""
            ? String(Math.max(0, Math.floor(Number(data.closing))))
            : "0",
        breakage:
          data.breakage != null && data.breakage !== ""
            ? String(Math.max(0, Math.floor(Number(data.breakage))))
            : "0",
        notes: data.notes || "",
      });
      // Reset validation state
      setErrors({
        demand: "",
        closing: "",
        breakage: "",
      });
      setTouched({
        demand: false,
        closing: false,
        breakage: false,
      });
    }
  }, [isOpen, data]);

  // Sanitize input to only allow positive integers
  const sanitizeNumericInput = (value: string): string => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/[^0-9]/g, "");
    // Return the sanitized value (empty string is allowed for user to clear field)
    return digitsOnly;
  };

  // Validation function
  const validateField = (field: string, value: string) => {
    // Empty values are not allowed - all fields are mandatory
    if (value === "" || value.trim() === "") {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }

    // Check if value contains only digits
    if (!/^\d+$/.test(value)) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)
        } must be a positive integer`;
    }

    // Parse as integer to ensure it's valid
    const intValue = parseInt(value, 10);
    if (isNaN(intValue)) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)
        } must be a valid number`;
    }

    // Check if value is negative (shouldn't happen with sanitization, but double-check)
    if (intValue < 0) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)
        } cannot be negative`;
    }

    return "";
  };

  // Validate all required fields
  const validateForm = () => {
    const newErrors = {
      demand: validateField("demand", formData.demand),
      closing: validateField("closing", formData.closing),
      breakage: validateField("breakage", formData.breakage),
    };

    setErrors(newErrors);

    // Mark all fields as touched
    setTouched({
      demand: true,
      closing: true,
      breakage: true,
    });

    // Return true if no errors
    return !Object.values(newErrors).some((error) => error !== "");
  };

  // Handle keydown to prevent non-numeric input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, and arrow keys
    if (
      [8, 9, 27, 13, 46, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true)
    ) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if (
      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
      (e.keyCode < 96 || e.keyCode > 105)
    ) {
      e.preventDefault();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Only sanitize numeric fields
    if (field === "demand" || field === "closing" || field === "breakage") {
      const sanitized = sanitizeNumericInput(value);
      setFormData((prev) => ({
        ...prev,
        [field]: sanitized,
      }));

      // Validate on change if field has been touched
      // Also validate immediately if field becomes empty (for better UX)
      if (touched[field as keyof typeof touched] || sanitized === "") {
        setErrors((prev) => ({
          ...prev,
          [field]: validateField(field, sanitized),
        }));
      }
    } else {
      // For non-numeric fields like notes, allow normal input
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, formData[field as keyof typeof formData]),
    }));
  };

  // Check if form is valid and complete
  const isFormValid = () => {
    // All fields are mandatory - check that they are non-empty and valid positive integers
    const demandValid =
      formData.demand.trim() !== "" && /^\d+$/.test(formData.demand.trim());
    const closingValid =
      formData.closing.trim() !== "" && /^\d+$/.test(formData.closing.trim());
    const breakageValid =
      formData.breakage.trim() !== "" && /^\d+$/.test(formData.breakage.trim());

    return demandValid && closingValid && breakageValid;
  };

  const handleSave = async () => {
    // Validate form before saving
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Convert string values to integers (all fields are mandatory, so values should be valid)
      const sanitizedData = {
        demand: Math.max(
          0,
          Math.floor(parseInt(formData.demand.trim(), 10) || 0)
        ),
        closing: Math.max(
          0,
          Math.floor(parseInt(formData.closing.trim(), 10) || 0)
        ),
        breakage: Math.max(
          0,
          Math.floor(parseInt(formData.breakage.trim(), 10) || 0)
        ),
        notes: formData.notes.trim(),
      };

      await onSave(sanitizedData);
      onClose();
    } catch (error) {
      console.error("Error saving data:", error);
      // Optionally set an error state here to show to user
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed max-w-md mx-auto inset-x-4 top-1/2 transform -translate-y-1/2 z-50">
        <div className="bg-white rounded-2xl w-full shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h2 className="font-inter text-lg font-semibold text-black">
              Edit Stock Data
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="demand"
                className="text-sm font-medium text-gray-700"
              >
                Demand <span className="text-red-600">*</span>
              </Label>
              <Input
                id="demand"
                type="text"
                inputMode="numeric"
                value={formData.demand}
                onChange={(e) => handleInputChange("demand", e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => handleBlur("demand")}
                className={`w-full ${errors.demand && touched.demand
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
                  }`}
                placeholder="Enter Demand stock"
              />
              {errors.demand && touched.demand && (
                <ErrorMessage message={errors.demand} />
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="closing"
                className="text-sm font-medium text-gray-700"
              >
                Closing Stock <span className="text-red-600">*</span>
              </Label>
              <Input
                id="closing"
                type="text"
                inputMode="numeric"
                value={formData.closing}
                onChange={(e) => handleInputChange("closing", e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => handleBlur("closing")}
                className={`w-full ${errors.closing && touched.closing
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
                  }`}
                placeholder="Enter closing stock"
              />
              {errors.closing && touched.closing && (
                <ErrorMessage message={errors.closing} />
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="breakage"
                className="text-sm font-medium text-gray-700"
              >
                Breakage <span className="text-red-600">*</span>
              </Label>
              <Input
                id="breakage"
                type="text"
                inputMode="numeric"
                value={formData.breakage}
                onChange={(e) => handleInputChange("breakage", e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => handleBlur("breakage")}
                className={`w-full ${errors.breakage && touched.breakage
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
                  }`}
                placeholder="Enter breakage amount"
              />
              {errors.breakage && touched.breakage && (
                <ErrorMessage message={errors.breakage} />
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="notes"
                className="text-sm font-medium text-gray-700"
              >
                Add Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="w-full"
                placeholder="Enter notes"
                maxLength={80}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !isFormValid()}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export function CompleteSellerProfile({
  userName,
  userInitials,
}: CompleteSellerProfileProps) {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useSellerProfileDirect();
  const { refetch: refetchExportData, isFetching: isExporting } =
    useSellerExportData();
  const { mutate, isPending, isError } = useUpdateStaffData();
  const { user: authUser } = useAuth();
  const [shopTable, setShopTable] = useState<any>(null);
  const [currentShopMeta, setCurrentShopMeta] = useState<{
    shopId?: string;
    reportDate?: string;
  }>({});
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<any>(null);
  const displayUserName =
    userName ||
    (authUser
      ? `${authUser.user_metadata?.first_name || ""} ${authUser.user_metadata?.last_name || ""
        }`.trim()
      : "User");
  const displayUserInitials =
    userInitials ||
    (authUser
      ? `${authUser.user_metadata?.first_name?.[0] || ""}${authUser.user_metadata?.last_name?.[0] || ""
        }`.toUpperCase()
      : "U");

  // Infinite scroll state
  const [displayedShops, setDisplayedShops] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const itemsPerPage = 5; // Load 5 shops at a time

  const handleLogout = async () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("auth_user");
    await AuthClientService.signOut();
    deleteCookie("auth_token");
    deleteCookie("auth_user");
    router.push("/staff?redirect=/staff/profile");
  };

  const handleRefresh = () => {
    console.log("🔄 CompleteSellerProfile: Manual refresh triggered");
    refetch();
  };

  // Initialize displayed shops when data loads
  useEffect(() => {
    if (data?.recentVisit && displayedShops.length === 0) {
      const initialShops = data.recentVisit.slice(0, itemsPerPage);
      setDisplayedShops(initialShops);
    }
  }, [data?.recentVisit, displayedShops.length, itemsPerPage]);

  // In CompleteSellerProfile component, add this useEffect:
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetch();
      }
    };

    const handleFocus = () => {
      console.log("🔄 Page focused, refetching data...");
      refetch();
    };

    // Listen for page visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refetch]);

  const loadMoreShops = useCallback(() => {
    if (!data?.recentVisit || isLoadingMore) return;

    setIsLoadingMore(true);
    setTimeout(() => {
      const currentLength = displayedShops.length;
      const nextBatch = data.recentVisit.slice(
        currentLength,
        currentLength + itemsPerPage
      );

      if (nextBatch.length > 0) {
        setDisplayedShops((prev) => [...prev, ...nextBatch]);
        console.log("🔄 Infinite Scroll: Loaded more shops", {
          previousCount: currentLength,
          newCount: currentLength + nextBatch.length,
          totalAvailable: data.recentVisit.length,
        });
      }

      setIsLoadingMore(false);
    }, 500);
  }, [data?.recentVisit, displayedShops.length, itemsPerPage, isLoadingMore]);

  const hasMoreShops = data?.recentVisit
    ? displayedShops.length < data.recentVisit.length
    : false;
  const [selectedShopParams, setSelectedShopParams] = useState<{
    shopId: string;
    lastVistedDate: string;
  } | null>(null);

  // Use the hook to fetch shop detail
  const {
    data: shopDetailData,
    isLoading: isLoadingShopDetail,
    isError: isErrorShopDetail,
    error: shopDetailError,
    refetch: refetchShopDetail,
  } = useStaffPanelShopDetail(
    selectedShopParams?.shopId || "",
    selectedShopParams?.lastVistedDate || "",
    !!selectedShopParams // Only fetch when selectedShopParams is set
  );

  // Effect to handle shop detail data when it arrives
  useEffect(() => {
    if (selectedShopParams && shopDetailData?.success && shopDetailData?.data) {
      setShopTable(shopDetailData.data);
      setCurrentShopMeta({
        shopId: shopDetailData.data?.meta?.shopId,
        reportDate: shopDetailData.data?.meta?.reportDate,
      });
      setIsStockModalOpen(true);
    }
  }, [shopDetailData, selectedShopParams]);

  // Effect to handle errors
  useEffect(() => {
    if (isErrorShopDetail) {
      showToast("error", "Failed to fetch shop detail");
      setSelectedShopParams(null); // Reset on error
    }
  }, [isErrorShopDetail]);

  // Function to trigger shop detail fetch
  const showShopDetail = (shop: { shopId: string; lastVistedDate: string }) => {
    const { shopId, lastVistedDate } = shop;
    // Close modal and reset state first to ensure fresh fetch
    setIsStockModalOpen(false);
    setSelectedShopParams(null);
    setShopTable(null);
    setCurrentShopMeta({});
    // Use a small delay to ensure state reset, then set new params
    setTimeout(() => {
      setSelectedShopParams({ shopId, lastVistedDate });
    }, 10);
  };

  // API call to update stock data
  const updateStockData = async (
    shopId: string,
    skuId: string,
    updatedData: any,
    reportDate?: string
  ) => {
    const payload = {
      shopId: shopId,
      skuId: skuId,
      demand: parseInt(updatedData.demand) || 0,
      closingStock: parseInt(updatedData.closing) || 0,
      breakage: parseInt(updatedData.breakage) || 0,
      reportDate: reportDate || new Date().toISOString().split("T")[0],
      notes: updatedData.notes || "",
    };

    mutate(payload, {
      onSuccess: (result) => {
        showToast("success", "Stock data updated successfully");
        refetch();
        // Refetch shop detail to update StockModal with new data
        if (selectedShopParams) {
          refetchShopDetail();
        }
      },
      onError: (error: any) => {
        console.error("Error updating stock data:", error);
        showToast(
          "error",
          error?.response?.data?.message || "Failed to update stock data"
        );
      },
    });
  };

  // Handle edit button click
  const handleEditClick = (row: any, shopId: string) => {
    setEditingData({ ...row, shopId });
    setIsEditModalOpen(true);
  };

  // Handle save from edit modal
  const handleEditSave = async (updatedData: any) => {
    console.log("updatedData", updatedData);
    if (!editingData) return;

    const shopIdToUse = editingData.shopId || currentShopMeta.shopId;
    if (!shopIdToUse) {
      showToast(
        "error",
        "Shop ID is missing. Please reopen the modal and try again."
      );
      return;
    }

    await updateStockData(
      shopIdToUse,
      editingData.skuId,
      updatedData,
      currentShopMeta.reportDate
    );
    setIsEditModalOpen(false);
    setEditingData(null);
  };

  // Function to get date category for grouping
  const getDateCategory = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

    const visitDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (visitDate.getTime() === today.getTime()) {
      return "Today";
    } else if (visitDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else if (visitDate.getTime() === dayBeforeYesterday.getTime()) {
      return "Day Before Yesterday";
    } else {
      const diffInDays = Math.floor(
        (today.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffInDays <= 7) {
        return `${diffInDays} days ago`;
      } else if (diffInDays <= 30) {
        const weeks = Math.floor(diffInDays / 7);
        return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
      } else {
        const months = Math.floor(diffInDays / 30);
        return `${months} month${months > 1 ? "s" : ""} ago`;
      }
    }
  };

  // Function to group shops by date categoryforma
  const groupShopsByDate = (shops: any[]) => {
    const grouped: { [key: string]: any[] } = {};

    shops.forEach((shop) => {
      const category = getDateCategory(shop.last_visit_date);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(shop);
    });

    // Sort shops within each category by last_updated (most recent first)
    Object.keys(grouped).forEach((category) => {
      grouped[category].sort((a, b) => {
        const dateA = new Date(a.last_updated || a.last_visit_date);
        const dateB = new Date(b.last_updated || b.last_visit_date);
        return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
      });
    });

    // Group older dates under "Previous Days"
    const previousDaysShops: any[] = [];
    const mainCategories = ["Today", "Yesterday", "Day Before Yesterday"];

    Object.keys(grouped).forEach((category) => {
      if (!mainCategories.includes(category)) {
        previousDaysShops.push(...grouped[category]);
        delete grouped[category];
      }
    });

    // Add "Previous Days" category if there are older shops
    if (previousDaysShops.length > 0) {
      grouped["Previous Days"] = previousDaysShops;
    }

    // Sort categories in a logical order
    const categoryOrder = [
      "Today",
      "Yesterday",
      "Day Before Yesterday",
      "Previous Days",
    ];
    const sortedCategories = Object.keys(grouped).sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a);
      const bIndex = categoryOrder.indexOf(b);

      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      } else if (aIndex !== -1) {
        return -1;
      } else if (bIndex !== -1) {
        return 1;
      } else {
        return a.localeCompare(b);
      }
    });

    return { grouped, sortedCategories };
  };

  if (error) {
    console.log("❌ CompleteSellerProfile: Error state rendered", error);
    return (
      <div className="max-w-md mx-auto lg:max-w-2xl ">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-inter text-lg lg:text-xl font-semibold leading-tight text-black flex-none">
            Hi there, {displayUserName}
          </h1>
          <div className="px-3 py-1 rounded-xl bg-purple-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="border-0 hover:opacity-80 transition-opacity cursor-pointer font-medium text-purple-700">
                  {displayUserInitials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={4}
                alignOffset={-8}
                className="w-24 sm:w-28 min-w-fit border-0 shadow-lg mt-1"
              >
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer justify-center !px-1 !py-1.5"
                >
                  <LogOut className="w-3 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="rounded-lg p-4 text-center bg-red-50 border border-red-200">
          <p className="text-red-600 text-sm">
            Failed to load data. Please try again.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Error: {error?.message || "Unknown error"}
          </p>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const handleExport = async () => {
    try {
      showToast("info", "Preparing export...");

      // Fetch the export data
      const result = await refetchExportData();

      if (!result.data || !result.data.success) {
        showToast("error", "Failed to fetch export data");
        return;
      }

      const salesData = result.data.data?.salesBySkuAndShop;

      if (!salesData || salesData.length === 0) {
        showToast("warning", "No data available to export");
        return;
      }

      // Convert to CSV
      const csvContent = convertToCSV(salesData);

      // Download CSV file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      const timestamp = new Date().toISOString().split("T")[0];
      link.setAttribute("href", url);
      link.setAttribute("download", `sales-report-${timestamp}.csv`);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("success", "Report exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      showToast("error", "Failed to export report");
    }
  };

  // Helper function to convert JSON to CSV
  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return "";
    const headers = [
      "Shop Name",
      "DP Code",
      "SKU Name",
      "Brand Name",
      "Category",
      "Package Size(ml)",
      "Breakage",
      "Demand",
      "Closing Stock",
      "Total Sales",
      "Report Count",
      "Last Report Date",
    ];

    // Create CSV rows
    const rows = data.map((item) => [
      item.shopName || "",
      item.dpCode || "",
      item.skuName || "",
      item.brandName || "",
      item.category || "",
      item.size || 0,
      item.breakage || 0,
      item.demand || 0,
      item.closingStock || 0,
      item.totalSales || 0,
      item.reportCount || 0,
      item.lastReportDate || "",
    ]);

    // Combine headers and rows
    const csvRows = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Escape cells that contain commas or quotes
            const cellStr = String(cell);
            if (
              cellStr.includes(",") ||
              cellStr.includes('"') ||
              cellStr.includes("\n")
            ) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(",")
      ),
    ];

    return csvRows.join("\n");
  };

  return (
    <div className="max-w-md mx-auto lg:max-w-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-inter text-lg lg:text-xl font-semibold leading-tight text-black flex-none">
          Hi there, {displayUserName}
        </h1>
        <div className="px-3 py-1 rounded-xl bg-purple-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="border-0 hover:opacity-80 transition-opacity cursor-pointer font-medium text-purple-700">
                {displayUserInitials}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              sideOffset={2}
              alignOffset={1}
              className="min-w-[140px] border border-gray-100 rounded-xl shadow-lg bg-white p-1"
            >
              <DropdownMenuItem
                onClick={handleExport}
                disabled={isExporting}
                className="text-sm text-purple-700 hover:text-purple-800 hover:bg-purple-50 cursor-pointer rounded-md px-2 py-1.5 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-700" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isExporting ? "Exporting..." : "Export Report"}</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer rounded-md px-2 py-1.5 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-lg p-4 text-left bg-white">
          <p className="font-inter text-xs font-medium text-black leading-[14px] mb-2">
            Today&apos;s Entries
          </p>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="font-inter text-xl lg:text-2xl font-bold text-primary">
              {parseInt(data?.headerCounts?.todays_shops) || 0} Shops
            </p>
          )}
        </div>

        <div className="rounded-lg p-4 text-left bg-white">
          <p className="font-inter text-xs font-medium text-black leading-[14px] mb-2">
            This Week&apos;s Entries
          </p>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="font-inter text-xl lg:text-2xl font-bold text-primary">
              {parseInt(data?.headerCounts?.weekly_shops) || 0} Shops
            </p>
          )}
        </div>
      </div>

      {/* Recent Visits Section */}
      <div className="mt-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-inter text-lg font-semibold text-black">
            Recent Visits
          </h2>
          {displayedShops.length > 0 && (
            <span className="text-sm text-gray-500">
              Showing {displayedShops.length} of{" "}
              {data?.recentVisit?.length || 0} shops
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto mt-4 scrollbar-hide">
            <div className="py-2 flex flex-col gap-4 scrollbar-hide">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div
              className="max-h-[calc(100vh-300px)] overflow-y-auto mt-4 scrollbar-hide"
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } =
                  e.currentTarget;
                // Load more when user scrolls to bottom
                if (
                  scrollHeight - scrollTop <= clientHeight + 100 &&
                  hasMoreShops &&
                  !isLoadingMore
                ) {
                  loadMoreShops();
                }
              }}
            >
              <div className="py-2 flex flex-col scrollbar-hide cursor-pointer">
                {displayedShops && displayedShops.length > 0 ? (
                  (() => {
                    const { grouped, sortedCategories } =
                      groupShopsByDate(displayedShops);
                    return sortedCategories.map((category) => (
                      <div key={category} className="mb-6">
                        {/* Date Category Heading */}
                        <div className="mb-3">
                          <h3 className="text-lg font-semibold text-black">
                            {category}
                          </h3>
                        </div>

                        {/* Shop Cards for this category */}
                        <div className="space-y-3">
                          {grouped[category].map((visit) => (
                            <div
                              key={visit.id}
                              onClick={() =>
                                showShopDetail({
                                  shopId: visit.id,
                                  lastVistedDate: visit.last_visit_date,
                                })
                              }
                            >
                              <ShopCard
                                showRecentTime={false}
                                shop={{
                                  id:
                                    visit.last_updated || visit.last_visit_date,
                                  name: visit.shop_name,
                                  slug: visit.dp_code,
                                  address:
                                    visit.address ||
                                    `${visit.district}, ${visit.state}`,
                                  time: formatLastVisitDate(visit.last_updated),
                                  dpCode:
                                    visit?.original_dp_code || visit.dp_code,
                                  vendorCode: visit?.vendor_code || "",
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent visits found</p>
                  </div>
                )}

                {/* Loading more indicator */}
                {isLoadingMore && (
                  <div className="flex justify-center py-4">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm">Loading more shops...</span>
                    </div>
                  </div>
                )}

                {/* Load more button (fallback) */}
                {hasMoreShops && !isLoadingMore && (
                  <div className="flex justify-center py-4">
                    <Button
                      variant="outline"
                      onClick={loadMoreShops}
                      className="flex items-center bg-primary text-white space-x-2"
                    >
                      <span>Load More Shops</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Stock Modal */}
      <StockModal
        isOpen={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false);
          setSelectedShopParams(null);
          setShopTable(null);
          setCurrentShopMeta({});
        }}
        data={shopTable}
        shopId={currentShopMeta.shopId}
        onEditClick={handleEditClick}
      />

      {/* Edit Modal */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingData(null);
        }}
        data={editingData}
        onSave={handleEditSave}
      />
    </div>
  );
}
