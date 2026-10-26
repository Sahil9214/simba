'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface StockUpdateSectionProps {
    date?: string;
    day?: string;
    time?: string;
    uploadedImage?: File | string | null;
    className?: string;
}

function getOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

const StockUpdateSection: React.FC<StockUpdateSectionProps> = ({
    date,
    day,
    time,
    uploadedImage = null,
    className = ""
}) => {
    const [nowDate, setNowDate] = useState<string>("");
    const [nowDay, setNowDay] = useState<string>("");
    const [nowTime, setNowTime] = useState<string>("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const now = new Date();

        const weekday = now.toLocaleDateString(undefined, { weekday: 'long' });
        const month = now.toLocaleDateString(undefined, { month: 'long' });
        const dayNum = now.getDate();
        const year = now.getFullYear();

        const formattedDate = `${getOrdinal(dayNum)} ${month} ${year}`;
        const formattedTime = now.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        setNowDate(formattedDate);
        setNowDay(weekday);
        setNowTime(formattedTime);
    }, []);

    useEffect(() => {
        if (uploadedImage && uploadedImage instanceof File) {
            const url = URL.createObjectURL(uploadedImage);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
        setPreviewUrl(null);
    }, [uploadedImage]);

    const displayDate = date ?? nowDate;
    const displayDay = day ?? nowDay;
    const displayTime = time ?? nowTime;

    return (
        <div className={`flex flex-col items-start p-3 gap-4 mx-auto w-full max-w-[361px] h-[162px] bg-white rounded-lg ${className}`}>
            {/* Header with Date and Time */}
            <div className="flex flex-row justify-between items-center w-full">
                {/* Date and Day */}
                <div className="flex flex-row items-start gap-2">
                    <span className="font-inter font-medium text-sm leading-[120%] text-center text-sidebar-foreground">
                        {displayDate}
                    </span>
                    <span className="font-inter font-medium text-xs leading-[120%] text-center text-sidebar-foreground">
                        |
                    </span>
                    <span className="font-inter font-medium text-sm leading-[120%] text-center text-sidebar-foreground">
                        {displayDay}
                    </span>
                </div>

                {/* Time */}
                <span className="font-inter font-medium text-sm leading-[120%] text-center text-[#EF4444]">
                    {displayTime}
                </span>
            </div>

            {/* Content Row */}
            <div className="flex flex-row items-start gap-3 w-full max-h-[100px]">
                {/* Left Box - Image or Placeholder */}
                <div className="box-border flex flex-row items-center justify-center w-full h-full bg-gray-100 border border-[#E5E5E5] rounded flex-1">
                    {uploadedImage ? (
                        <div className="w-full h-full relative overflow-hidden rounded">
                            {typeof uploadedImage === 'string' ? (
                                <Image
                                    src={uploadedImage}
                                    alt="Uploaded stock image"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : previewUrl ? (
                                <Image
                                    src={previewUrl}
                                    alt="Uploaded stock image"
                                    className="w-full h-full object-cover"
                                    fill
                                    unoptimized
                                />
                            ) : null}
                        </div>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center">
                            <span className="text-gray-500 text-xs">No Image</span>
                        </div>
                    )}
                </div>

                {/* Right Box - Pending Status */}
                <div className="box-border flex flex-row items-center justify-center p-6 w-full h-full bg-[#FAFAFA] border border-[#E5E5E5] rounded flex-1">
                    <span className="font-inter font-medium text-xs leading-[120%] text-center text-sidebar-foreground opacity-24">
                        Today&apos;s stock update pending
                    </span>
                </div>
            </div>
        </div>
    );
};

export default StockUpdateSection;
