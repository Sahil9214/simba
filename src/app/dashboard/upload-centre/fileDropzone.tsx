"use client";

import React, { useRef, useState, useCallback } from "react";
import { Upload } from "lucide-react";
import { SUPPORT_FORMAT } from "@/lib/constants";
import { FileRow } from "@/lib/types/legacy";

type FileDropzoneProps = {
    onFiles?: (files: File[]) => void;
    accept?: string;
    maxFiles?: number;
    setViewFile?: (file: FileRow) => void;
    viewFile?: FileRow | null;
    className?: string;
    disabled?: boolean;
};

export const FileDropzone: React.FC<FileDropzoneProps> = ({
    onFiles,
    accept = ".xlsx,.xls,.pdf,.doc,.docx,.csv",
    maxFiles = 10,
    setViewFile,
    viewFile,
    className = "",
    disabled = false,
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setDragging] = useState(false);
    const openFile = () => inputRef.current?.click();

    const handleFiles = useCallback(
        (fileList: FileList | null) => {
            if (!fileList) return;
            let files = Array.from(fileList);
            if (maxFiles) files = files.slice(0, maxFiles);
            onFiles?.(files);
            setViewFile?.(files[0] as unknown as FileRow)
        },
        [onFiles, maxFiles, setViewFile]
    );

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        // reset so selecting the same file twice still triggers change
        e.currentTarget.value = "";
    };

    return (
        <div
            className={[
                // Frame 4
                "flex flex-col items-center",
                "p-6 md:px-14 md:py-6  gap-[14px]",
                "bg-white rounded-2xl",
                "border border-dashed",
                "border-primary",
                "shadow-[0_0_0_1px_rgba(0,0,0,0)]", // keep crisp edges
                "transition-colors",
                isDragging ? "bg-indigo-50/40 ring-2 ring-indigo-300/60" : "",
                disabled ? "opacity-50 pointer-events-none" : "",
                className
            ].join(" ")}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            role="region"
            aria-label="File upload dropzone"
        >
            {/* Frame 3 */}
            <div className="flex flex-col items-center gap-2">
                {/* Frame 2 (icon circle) */}
                {
                    viewFile ? (
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-center text-sm leading-[140%] text-sidebar-foreground font-semibold">
                                {viewFile.name}
                            </p>
                        </div>
                    ) : (<div className="w-11 h-11 rounded-full bg-[#EEF2FF] flex items-center justify-center">
                        <Upload className="w-6 h-6 stroke-primary" />
                    </div>)
                }


                {/* Button */}
                <button
                    type="button"
                    onClick={openFile}
                    disabled={disabled}
                    className={[
                        "inline-flex items-center cursor-pointer justify-center gap-2",
                        "h-8 px-3 rounded-lg",
                        "bg-primary text-[#FAFAFA]",
                        "text-xs font-medium",
                        "shadow-sm hover:brightness-105 active:brightness-95",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-300",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                    ].join(" ")}
                >
                    Click to Upload or Drag & Drop
                </button>
            </div>

            {/* Supported formats */}
            <p className="text-center text-sm leading-[140%] text-custom-gray">
                {SUPPORT_FORMAT}
            </p>

            {/* Hidden input */}
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple
                disabled={disabled}
                className="hidden"
                onChange={onChange}
            />
        </div>
    );
};



