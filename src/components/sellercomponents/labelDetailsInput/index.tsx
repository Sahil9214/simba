"use client";

import React, { useState, useRef, useEffect } from "react";
import { ProductInputSection } from "./ProductInputSection";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export interface ProductData {
  sales: string;
  closing: string;
  availability: string;
  demand: string;
  breakage: string;
  note: string;
}

// API function to upload data
const uploadSalesData = async (data: {
  "330ml": ProductData;
  "650ml": ProductData;
}) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';
    const response = await fetch(`${API_BASE_URL}/api/seller/shop-sales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to upload sales data');
    }
    return result;
  } catch (error) {
    console.error("Error during sales data upload:", error);
    toast.error(
      `An unexpected error occurred: ${error instanceof Error ? error.message : "Unknown error"
      }`
    );
    throw error; // Re-throw the error so TanStack Query's onError can still catch it
  }
};

export const LabelDetailsInput: React.FC = () => {
  const params = useParams();
  const sellerShop = params.sellerShop as string;
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [showNoteInput, setShowNoteInput] = useState<string | null>(null);
  const [productData, setProductData] = useState<{
    "330ml": ProductData;
    "650ml": ProductData;
  }>({
    "330ml": {
      sales: "",
      closing: "",
      availability: "",
      demand: "",
      breakage: "",
      note: "",
    },
    "650ml": {
      sales: "",
      closing: "",
      availability: "",
      demand: "",
      breakage: "",
      note: "",
    },
  });
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const router = useRouter();
  // TanStack Query mutation for uploading data
  const uploadMutation = useMutation({
    mutationFn: uploadSalesData,
    onSuccess: (data) => {
      console.log("Upload successful:", data);
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      toast.error("Failed to upload sales data. Please try again.");
      router.push(`/staff/profile/${sellerShop}?success=true`);
    },
  });

  const handleFieldClick = (field: string, product: "330ml" | "650ml") => {
    setCurrentField(`${product}-${field}`);
  };

  const handleNoteClick = (product: "330ml" | "650ml") => {
    setShowNoteInput(showNoteInput === product ? null : product);
  };

  const handleInputChange = (
    value: string,
    product: "330ml" | "650ml",
    field: keyof ProductData
  ) => {
    setProductData((prev) => ({
      ...prev,
      [product]: {
        ...prev[product],
        [field]: value,
      },
    }));
  };

  const handleNext = () => {
    if (!currentField) return;
    const [product, field] = currentField.split("-");
    const fields = ["sales", "closing", "demand", "breakage"];
    const idx = fields.indexOf(field);
    if (idx < fields.length - 1) {
      setCurrentField(`${product}-${fields[idx + 1]}`);
    } else {
      setCurrentField(null);
    }
  };

  const handleNoteChange = (value: string, product: "330ml" | "650ml") => {
    setProductData((prev) => ({
      ...prev,
      [product]: { ...prev[product], note: value },
    }));
  };

  // Updated function to check if ALL required fields are filled (excluding notes)
  const areAllRequiredFieldsFilled = () => {
    const requiredFields = ["sales", "closing", "demand", "breakage"];

    return Object.entries(productData).every(([_, product]) =>
      requiredFields.every(
        (field) => product[field as keyof ProductData].trim() !== ""
      )
    );
  };

  const handleUpload = () => {
    if (areAllRequiredFieldsFilled()) {
      uploadMutation.mutate(productData);
    }
  };

  // Auto-focus the input whenever currentField changes
  useEffect(() => {
    if (currentField && inputRefs.current[currentField]) {
      inputRefs.current[currentField]?.focus();
    }
  }, [currentField]);

  return (
    <div className="space-y-6">
      <ProductInputSection
        product="Simba Beer Large"
        volume="330ml"
        data={productData["330ml"]}
        onFieldClick={(f) => handleFieldClick(f, "330ml")}
        onNoteClick={() => handleNoteClick("330ml")}
        showNoteInput={showNoteInput === "330ml"}
        onNoteChange={(v) => handleNoteChange(v, "330ml")}
        onInputChange={(value, field) =>
          handleInputChange(value, "330ml", field)
        }
        currentField={
          currentField?.startsWith("330ml") ? currentField.split("-")[1] : null
        }
        inputRefs={inputRefs}
      />

      <ProductInputSection
        product="Simba Beer Large"
        volume="650ml"
        data={productData["650ml"]}
        onFieldClick={(f) => handleFieldClick(f, "650ml")}
        onNoteClick={() => handleNoteClick("650ml")}
        showNoteInput={showNoteInput === "650ml"}
        onNoteChange={(v) => handleNoteChange(v, "650ml")}
        onInputChange={(value, field) =>
          handleInputChange(value, "650ml", field)
        }
        currentField={
          currentField?.startsWith("650ml") ? currentField.split("-")[1] : null
        }
        inputRefs={inputRefs}
      />

      {/* Upload button - only shows when all required fields are filled */}
      {areAllRequiredFieldsFilled() && (
        <div className="bottom-0 left-0 right-0 p-4 z-30">
          <div className="mx-auto max-w-[200px]">
            <button
              style={{
                background: "#FFFCFC",
                border: "1px solid rgba(239, 68, 68, 0.24)",
                boxShadow:
                  "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)",
              }}
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="w-full font-inter p-3 text-sm border-2 border-primary text-primary rounded-full font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusCircle className="w-4 h-4 opacity-52" />
              {uploadMutation.isPending ? "Uploading..." : "Update Shop Sales"}
            </button>
          </div>
        </div>
      )}

      {/* Next button */}
      {currentField && (
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleNext}
            className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
