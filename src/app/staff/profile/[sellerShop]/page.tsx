'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { BackButton } from '@/components/sellercomponents/back-button';
// import IndividualShops from '@/components/sellercomponents/sellerShop/individualShops';
// import AnalyticsCard from '@/components/sellercomponents/sellerShop/analyticsCard';
// import Bottles from '@/components/sellercomponents/sellerShop/bottles';
import { PlusCircle, X, XCircle, ImagePlus, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { showToast } from '@/components/ui/toast';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { IndividualShopsSkeleton } from '@/common/skeleton/individualShopSkeleton';
import { BottlesSkeleton } from '@/common/skeleton/BottleSkeleon';
import { AnalyticsCardSkeleton } from '@/common/skeleton/analytics-staff-skeleton';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/lib/rbac';
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const Bottles = dynamic(
  () => import("@/components/sellercomponents/sellerShop/bottles"),
  {
    loading: () => <BottlesSkeleton />,
    ssr: false,
  }
);
const AnalyticsCard = dynamic(
  () => import('@/components/sellercomponents/sellerShop/analyticsCard'),
  {
    loading: () => <AnalyticsCardSkeleton />,
    ssr: false,
  }
);
const IndividualShops = dynamic(
  () => import('@/components/sellercomponents/sellerShop/individualShops'),
  {
    loading: () => <IndividualShopsSkeleton />,
    ssr: false,
  }
);





// Sample data - fallback when API fails
const fixedShopData = {
  title: '',
  subtitleLeft: '',
  subtitleRight: ''
};


// Image compression utility
const compressImage = async (file: File, targetSizeKB: number = 200): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new window.Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate new dimensions (max 1920px width, maintain aspect ratio)
        let width = img.width;
        let height = img.height;
        const maxWidth = 1920;
        const maxHeight = 1920;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Start with quality of 0.8 and reduce until target size is met
        let quality = 0.8;
        const targetSize = targetSizeKB * 1024;

        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              // If size is good or quality is too low, use this result
              if (blob.size <= targetSize || quality <= 0.1) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                // Reduce quality and try again
                quality -= 0.1;
                tryCompress();
              }
            },
            'image/jpeg',
            quality
          );
        };

        tryCompress();
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

function SellerShopPage() {
  // Replace single image state with multiple images
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]); // Store preview URLs
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const params = useParams();

  // State for shop data
  const [shopDetails, setShopDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for existing image
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [hasExistingImage, setHasExistingImage] = useState(false);

  const MAX_IMAGES = 5;
  const MIN_IMAGES = 1;

  const fetchShopDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const encodedSellerShop = encodeURIComponent(params.sellerShop as string);



      const response = await fetch(`${API_BASE_URL}/api/seller/shop-detail/${encodedSellerShop}`, {
        method: "GET",
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {

        setShopDetails(result.data);

      } else {
        throw new Error(result.error || 'Failed to fetch shop details');
      }
    } catch (err) {
      console.error('❌ Error fetching shop details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch shop details');
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingImage = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const dpcode = params.sellerShop as string;

      const response = await fetch(`${API_BASE_URL}/api/seller/shop/${dpcode}/upload`, {
        method: "GET",
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const result = await response.json();
        // Backend returns: { success, data: { dp_code, images: { image_urls: [...], last_updated }, has_images } }
        if (result.success && result.data?.has_images && result.data?.images?.image_urls) {
          const imageUrls = result.data.images.image_urls;
          setExistingImage(imageUrls[0]); // Set first image as existing
          setHasExistingImage(true);
          setUploadedUrls(imageUrls); // Set all uploaded URLs to activate bottles
        }
      }
    } catch (err) {
      console.error('❌ Error checking existing image:', err);
    }
  };

  useEffect(() => {
    if (params.sellerShop) {
      fetchShopDetails();
      checkExistingImage();
    }
  }, [params.sellerShop]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // Use API data or fallback to fixed data
  const shopData = shopDetails?.header ? {
    title: shopDetails?.header?.shop_name ?? "",
    subtitleLeft: shopDetails?.header?.last_visit_date ?? "",
    subtitleRight: shopDetails?.header?.address ?? "",

  } : fixedShopData;

  const analyticsData = shopDetails?.stockDetails ? {
    inStock: shopDetails.stockDetails.in_stock,
    lowStock: shopDetails.stockDetails.low_stock,
    outOfStock: shopDetails.stockDetails.out_of_stock
  } : {
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  };

  const bottlesData = shopDetails?.productCategories ? {
    beerBottles: shopDetails.productCategories.find((cat: any) => cat.name === 'Beer Bottles')?.count || 0,
    whiskey: shopDetails.productCategories.find((cat: any) => cat.name === 'WHISKY')?.count || 0,
    vodkaBottles: shopDetails.productCategories.find((cat: any) => cat.name === 'Vodka Bottles')?.count || 0
  } : {
    beerBottles: 0,
    whiskey: 0,
    vodkaBottles: 0
  };

  const handleUploadClick = () => {
    if (isCompressing) {

      return;
    }
    if (uploadedImages.length >= MAX_IMAGES) {
      showToast('error', `Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      showToast('error', 'Please select valid image files');
      return;
    }

    // Check if adding these would exceed the limit
    const totalImages = uploadedImages.length + imageFiles.length;
    let filesToAdd: File[] = [];

    if (totalImages > MAX_IMAGES) {
      showToast('error', `You can only upload ${MAX_IMAGES} images maximum. Currently ${uploadedImages.length} selected.`);
      const remaining = MAX_IMAGES - uploadedImages.length;
      filesToAdd = imageFiles.slice(0, remaining);
    } else {
      filesToAdd = imageFiles;
    }

    if (filesToAdd.length === 0) {
      return;
    }

    try {
      setIsCompressing(true);


      // Compress all images in parallel
      const compressedFiles = await Promise.all(
        filesToAdd.map(file => compressImage(file, 200))
      );

      // Create preview URLs for compressed files
      const newPreviewUrls = compressedFiles.map(file => URL.createObjectURL(file));

      // Update state with compressed files
      setUploadedImages(prev => [...prev, ...compressedFiles]);
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);

      const totalSize = compressedFiles.reduce((sum, file) => sum + file.size, 0);
      showToast('success', `${compressedFiles.length} image(s) compressed to ${(totalSize / 1024).toFixed(0)}KB total`);

    } catch (error) {
      console.error('❌ Compression failed:', error);
      showToast('error', 'Failed to compress images. Please try again.');
    } finally {
      setIsCompressing(false);
      // Reset input to allow selecting same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    // Revoke the object URL to prevent memory leak
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadToS3 = async () => {
    if (uploadedImages.length < MIN_IMAGES) {
      showToast('error', `Please select at least ${MIN_IMAGES} image`);
      return;
    }

    if (uploadedImages.length > MAX_IMAGES) {
      showToast('error', `Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    try {
      setIsUploading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      // Create FormData and append all images at once
      const formData = new FormData();
      uploadedImages.forEach((image) => {
        formData.append('images', image); // Backend expects 'images' field
      });

      // Single POST request with all images
      const uploadRes = await fetch(`${API_BASE_URL}/api/seller/shop/${params.sellerShop}/upload`, {
        method: 'POST',
        body: formData,
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => null);
        throw new Error(errorData?.error || `Upload failed with status ${uploadRes.status}`);
      }

      const uploadJson = await uploadRes.json();

      // Backend returns: { success, data: { image_ids, dp_code, file_count, s3_urls, uploaded_at, updated_records }, message }
      if (uploadJson.success && uploadJson.data?.s3_urls) {
        setUploadedUrls(uploadJson.data.s3_urls);
        showToast('success', uploadJson.message || `${uploadJson.data.file_count} images uploaded successfully`);

        // Clear selected images after successful upload
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setUploadedImages([]);
        setPreviewUrls([]);
      } else {
        throw new Error(uploadJson.error || 'Upload failed');
      }

    } catch (e) {
      console.error('❌ Upload flow failed', e);
      showToast('error', e instanceof Error ? e.message : 'Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearAllImages = () => {
    // Revoke all preview URLs to prevent memory leaks
    previewUrls.forEach(url => URL.revokeObjectURL(url));

    setUploadedImages([]);
    setPreviewUrls([]);
    setUploadedUrls([]);
    setExistingImage(null);
    setHasExistingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsUploading(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F6F6]">
        <div className="max-w-md mx-auto lg:max-w-2xl p-4 space-y-4">
          <BackButton />
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state - show page with fallback data
  if (error) {
    console.log('⚠️ Error loading shop details, using fallback data:', error);
  }
  return (
    <ProtectedRoute requireAuth={true} requiredRole={UserRole.STAFF}>
    <div className="relative min-h-screen overflow-y-auto pb-24">
      <div className="max-w-md mx-auto lg:max-w-2xl p-4 space-y-4">
        <BackButton />

        <IndividualShops
          title={shopData.title}
          subtitleLeft={shopData.subtitleLeft}
          subtitleRight={shopData.subtitleRight}

        />

        <AnalyticsCard
          inStock={analyticsData.inStock}
          lowStock={analyticsData.lowStock}
          outOfStock={analyticsData.outOfStock}
        />

        <Bottles
          beerBottles={bottlesData.beerBottles}
          whiskey={bottlesData.whiskey}
          vodkaBottles={bottlesData.vodkaBottles}
          hasUploadedImage={uploadedUrls.length > 0 || hasExistingImage}
          sellerShop={params.sellerShop as string}
          productCategories={shopDetails?.productCategories}
        />

        {/* Image Upload Section - Show 5 slots */}
        {uploadedImages.length === 0 && uploadedUrls.length === 0 && !hasExistingImage && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Upload Images (Min {MIN_IMAGES}, Max {MAX_IMAGES})
            </h3>
            <div className="grid grid-cols-3 gap-2 pb-5">
              {Array.from({ length: MAX_IMAGES }).map((_, index) => (
                <div
                  key={index}
                  onClick={handleUploadClick}
                  className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <ImagePlus className="w-8 h-8 text-gray-400" />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Tap any slot to add images
            </p>
          </div>
        )}

        {/* Image Preview Section with 5 slots */}
        {uploadedImages.length > 0 && uploadedUrls.length === 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm max-h-[35vh] pb-20 overflow-y-auto">
            <div className="flex items-center justify-between mb-3  bg-white pb-2 z-10">
              <h3 className="text-sm font-medium text-gray-900">
                Selected Images ({uploadedImages.length}/{MAX_IMAGES})
              </h3>
              {uploadedImages.length < MIN_IMAGES && (
                <span className="text-xs text-red-500 font-medium">
                  Min {MIN_IMAGES} required
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 ">

              {uploadedImages.map((file, index) => (
                <div key={`preview-${index}-${file.name}`} className="relative aspect-square">
                  <Image
                    src={previewUrls[index]}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                    width={40}
                    height={40}
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {uploadedImages.length < MAX_IMAGES &&
                Array.from({ length: MAX_IMAGES - uploadedImages.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    onClick={handleUploadClick}
                    className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <ImagePlus className="w-8 h-8 text-gray-400" />
                  </div>
                ))}
            </div>

            {/* Add More Images Button - Visible and clear */}
            {uploadedImages.length < MAX_IMAGES && (
              <button
                onClick={handleUploadClick}
                disabled={isCompressing}
                className="w-full mt-3 p-2.5 bg-blue-50 border-2 border-blue-300 border-dashed text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusCircle className="w-5 h-5" />
                {isCompressing ? 'Compressing images...' : `Add More Images (${MAX_IMAGES - uploadedImages.length} slots remaining)`}
              </button>
            )}
          </div>
        )}

        {/* Show uploaded images */}
        {uploadedUrls.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm max-h-[38vh] pb-28 overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-900 mb-3  bg-white pb-2 z-10">
              Uploaded Images ({uploadedUrls.length})
            </h3>
            <div className="grid grid-cols-3 gap-2 overflow-y-auto scrollbar-hide max-h-[38vh]">
              {uploadedUrls.map((url, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={url}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                    width={150}
                    height={150}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show existing image */}
        {/* {hasExistingImage && existingImage && uploadedImages.length === 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Current Shop Image</h3>
            <div className="relative">
              <Image
                src={existingImage}
                alt="Current shop image"
                className="w-full h-48 object-cover rounded-lg"
                width={100}
                height={100}
              />
            </div>
          </div>
        )} */}
      </div>

      {/* Hidden file input - allow multiple selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        style={{ display: 'none' }}
      />

      {/* Upload Button - Only show when images are selected but not uploaded */}
      {uploadedImages.length > 0 && uploadedUrls.length === 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-30">
          <div className="max-w-md mx-auto lg:max-w-2xl flex gap-3">
            <button
              style={{
                background: (uploadedImages.length < MIN_IMAGES || isCompressing) ? '#E5E7EB' : '#FFFCFC',
                border: '1px solid rgba(34, 197, 94, 0.24)',
                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
              }}
              onClick={handleUploadToS3}
              disabled={isUploading || isCompressing || uploadedImages.length < MIN_IMAGES}
              className="w-full font-inter p-3 text-sm border-2 border-green-600 text-green-600 rounded-full font-medium hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCompressing ? 'Compressing…' : isUploading ? 'Uploading…' : `Upload ${uploadedImages.length} Image${uploadedImages.length > 1 ? 's' : ''}`}
            </button>
            <button
              style={{
                background: '#FFFCFC',
                border: '1px solid rgba(239, 68, 68, 0.24)',
                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
              }}
              onClick={handleClearAllImages}
              disabled={isCompressing || isUploading}
              className="w-full flex items-center justify-center gap-2 font-inter p-3 text-sm border-2 border-red-500 text-red-500 rounded-full font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4 opacity-52" />
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Unselect Button - Show after upload is complete */}
      {uploadedUrls.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-30">
          <div className="max-w-md mx-auto lg:max-w-2xl">
            <button
              style={{
                background: '#FFFCFC',
                border: '1px solid rgba(239, 68, 68, 0.24)',
                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
              }}
              onClick={handleClearAllImages}
              className="w-full font-inter p-3 text-sm border-2 border-red-500 text-red-500 rounded-full font-medium hover:bg-primary transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-6 h-6 text-primary opacity-52" />
              Unselect Images
            </button>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}

export default SellerShopPage;
