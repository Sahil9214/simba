import React from 'react'

export const ChartHeadings = ({ heading, description }: { heading: string, description?: string }) => {
  return (
    <div className="flex flex-col">
      <h3 className="font-geist text-base leading-normal font-bold text-[#101828] mb-2">
        {heading}
      </h3>
      {description && (
        <p className="font-geist text-sm max-w-2xl text-gray-500 leading-5">
          {description}
        </p>
      )}
    </div>
  )
}

