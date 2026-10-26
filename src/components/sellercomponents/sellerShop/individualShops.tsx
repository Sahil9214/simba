import React from 'react';
import Image from 'next/image';

type IndividualShopsProps = {
  title?: string;
  subtitleLeft?: string;
  subtitleRight?: string;
};

function IndividualShops({
  title,
  subtitleLeft,
  subtitleRight,
}: IndividualShopsProps) {
  return (
    <div className="relative box-border flex flex-col items-start py-2  w-full  bg-white border border-[#E5E5E5] shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-lg ">


      <div className="relative flex flex-col justify-center items-start p-4 gap-2 w-full h-[76px] z-[1]">
        <div className="absolute inset-0 overflow-hidden">
          {/* Blurred background element */}
          <div className='absolute right-0 top-0 w-full h-full'
            style={{
              backgroundImage: 'url(/images/seller-mask-image.webp)',
              backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
              opacity: 0.4,
            }} >
          </div>
        </div>
        <div className="flex flex-row justify-between items-center gap-2 w-full h-[22px]">
          <h3 className="font-inter font-bold text-sm leading-[120%] text-[#955EFF]">
            {title}
          </h3>
          <div className="w-4 h-4">
            <Image src="/svg/Store.svg" alt="Store" width={16} height={16} loading='lazy' />
          </div>
        </div>

        <div className="flex flex-row items-start gap-1 ">
          <span className="font-inter font-medium text-[10px] leading-[120%] text-sidebar-foreground opacity-52">
            {subtitleLeft
              ? new Date(subtitleLeft).toLocaleDateString("en-GB")
              : ""}
          </span>

          <span className="font-inter font-semibold text-[10px] leading-[120%] text-sidebar-foreground opacity-52">
            {subtitleRight?.replace("NEW DELHI, DELHI, NEW DELHI", "New Dehli")}
          </span>
        </div>
      </div>

      <div className="absolute left-0 bottom-0 w-full h-px bg-[#D9D9D9] opacity-40" />
    </div>
  );
}

export default IndividualShops;


