// toast.tsx
"use client";

import { toast } from "sonner";
import { toastConfig, ToastVariant } from "@/lib/toast.config";
import React from "react";

/**
 * showToast - single entrypoint for toasts across app
 *
 * @param variant - "success" | "error" | "warning" | "info"
 * @param title - short bold title
 * @param description - optional description (smaller, muted)
 * @param duration - milliseconds (default 4000). Set 0 for sticky.
 */
export function showToast(
    variant: ToastVariant,
    title: string,
    description?: string,
    duration: number = 3000
) {
    const cfg = toastConfig[variant];
    const IconComponent = cfg.icon;

    toast.custom(
        (t) => (
            <div
                role="status"
                aria-live="polite"
                className={`max-w-md w-full flex items-center  justify-center gap-3 p-3 rounded-lg shadow-sm border ${cfg.containerClass} px-4 py-3`}
            >
                <IconComponent className={`w-5 h-5 ${cfg.iconClassName}`} />

                <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm leading-5 ${cfg.titleClass}`}>
                        {title}
                    </div>
                    {description && (
                        <div className={`mt-1 text-xs leading-4 ${cfg.descClass}`}>
                            {description}
                        </div>
                    )}
                </div>

                {/* optional close button (Sonner provides built-in close control too) */}
                {/* <button
                    onClick={() => toast.dismiss(t as string | number)}
                    aria-label="Close notification"
                    className="ml-3 shrink-0 rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/5"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 8.586L15.293 3.293a1 1 0 011.414 1.414L11.414 10l5.293 5.293a1 1 0 01-1.414 1.414L10 11.414l-5.293 5.293a1 1 0 01-1.414-1.414L8.586 10 3.293 4.707A1 1 0 014.707 3.293L10 8.586z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button> */}
            </div>
        ),
        { duration }
    );
}
