import React from 'react';
import { beer_bottles, vodka_bottles, stout_beer } from '@/assets/icons';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface BottlesProps {
  beerBottles?: number;
  whiskey?: number;
  vodkaBottles?: number;
  hasUploadedImage?: boolean;
  sellerShop?: string;
  success?: string;
  productCategories?: Array<{
    name: string;
    slug: string;
    count: number;
    image: string;
  }>;
}

function Bottles({
  beerBottles,
  whiskey,
  vodkaBottles,
  hasUploadedImage = false,
  sellerShop,
  success,
  productCategories = [],
}: BottlesProps) {
  const router = useRouter();

  // Default categories if no productCategories provided
  const defaultCategories = [
    { name: 'Beer Bottles', slug: 'beer-bottles', count: beerBottles || 0, image: beer_bottles },
    { name: 'Whiskey', slug: 'whisky', count: whiskey || 0, image: "/images/simba-whiskey.png" },
    { name: 'Vodka Bottles', slug: 'vodka-bottles', count: vodkaBottles || 0, image: vodka_bottles },
  ];

  const categories = productCategories.length > 0 ? productCategories : defaultCategories;

  // Handle click safely
  const handleClick = (slug: string) => {
    if (!hasUploadedImage) return; // prevent navigation
    router.push(`/staff/profile/${sellerShop}/${slug}`);
  };

  return (
    <div
      className={`flex flex-row items-start p-0 w-full h-auto gap-2 transition-opacity duration-300 ${hasUploadedImage ? 'opacity-100 cursor-pointer' : 'opacity-20 cursor-not-allowed'
        }`}
    >
      {categories.map((category, index) => (
        <div key={category.slug} className="flex flex-col items-start p-0 gap-3 w-full">
          <div
            className={`flex flex-col justify-center items-center p-3 gap-0 w-full h-[156px] bg-white rounded-lg flex-none order-0 self-stretch flex-grow-0 ${index === 0
              ? 'sm:rounded-l-lg'
              : index === categories.length - 1
                ? 'sm:rounded-r-lg'
                : ''
              }`}
            onClick={() => handleClick(category.slug)}
          >
            <div className="flex flex-row justify-center items-end p-0 w-full h-[110px] flex-none order-0 flex-grow-0">
              <Image
                src={category.image === "/api/placeholder/200/150" ? "/images/simba-whiskey.png" : category.image}
                alt={category.name}
                loading='lazy'
                className={`max-w-[60px] max-h-[130px] pb-2 ${hasUploadedImage ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                width={60}
                height={130}
              />
            </div>

            <div className="font-inter font-medium text-xs leading-[120%] text-center text-black">
              {category.name}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Bottles;
