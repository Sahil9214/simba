// lib/toastConfig.ts
export type ToastVariant = "success" | "error" | "warning" | "info";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";
import { ComponentType } from "react";


type VariantConfig = {
  icon: ComponentType<{ className?: string }>;
  titleClass: string;
  descClass: string;
  containerClass: string;
  iconClassName: string;
};

export const toastConfig: Record<ToastVariant, VariantConfig> = {
  success: {
    icon: CheckCircle2,
    titleClass: "text-green-800 dark:text-green-200",
    descClass: "text-green-600 dark:text-green-300",
    iconClassName: "text-green-600 dark:text-green-300",
    containerClass:
      "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800",
  },
  error: {
    icon: XCircle,
    titleClass: "text-red-800 dark:text-red-200",
    descClass: "text-red-600 dark:text-red-300",
    iconClassName: "text-red-600 dark:text-red-300",
    containerClass:
      "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800",
  },
  warning: {
    icon: AlertCircle,
    titleClass: "text-yellow-800 dark:text-yellow-200",
    descClass: "text-yellow-700 dark:text-yellow-300",
    iconClassName: "text-yellow-600 dark:text-yellow-300",
    containerClass:
      "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800",
  },
  info: {
    icon: Info,
    titleClass: "text-sky-800 dark:text-sky-200",
    descClass: "text-sky-600 dark:text-sky-300",
    iconClassName: "text-sky-600 dark:text-sky-300",
    containerClass:
      "bg-sky-50 dark:bg-sky-900/25 border-sky-200 dark:border-sky-800",
  },
};
