import Image from "next/image";
import { data_not_found } from "@/assets/icons";
import { RefreshCw } from 'lucide-react';

export function DataNotFoundError({ refetch }: { refetch?: () => void }) {
  return (
    <div className="flex flex-col max-h-[428px] items-center justify-center gap-4">
      <Image src={data_not_found} alt="Data Not Found" width={120} height={120} />
      <p className="font-inter text-sm text-placeholder-gray">We couldn’t find any records for your selection. Try refreshing to reload the data</p>
      {/* <button
        className="flex flex-row justify-center items-center px-4 py-2 gap-2 bg-[#F5F5F5] shadow-xs rounded-lg text-charcoal font-inter text-sm leading-5"
        onClick={refetch}
      >
        <RefreshCw className="h-4 w-4" />
        Refresh
      </button> */}
    </div>
  )
}
