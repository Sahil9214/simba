import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "../contexts/queryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";
import { Toaster } from "sonner";
// Import Recharts patch for React 19 compatibility
import "@/utils/recharts-patch";
// Import Mock Interceptor for offline dummy mode
import "@/utils/mockInterceptor";
import { RechartsErrorHandler } from "@/components/RechartsErrorHandler";

const geist = localFont({
  src: [
    {
      path: "./font/Geist-UltraLight.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "./font/Geist-Thin.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./font/Geist-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./font/Geist-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./font/Geist-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./font/Geist-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./font/Geist-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./font/Geist-Black.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./font/Geist-UltraBlack.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
  display: "swap",
  // fallback: ["system-ui", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
});

const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  preload: true,
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Roboto", "Helvetica Neue", "Arial"],
});

export const metadata: Metadata = {
  title: "Simba Beer Analytics Portal",
  description: "Simba Beer Analytics Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />
      </head>
      <body
        className={`${geist.variable} ${interFont.variable} antialiased h-full lg:h-screen overflow-hidden`}
      >
        <RechartsErrorHandler />
        <AuthErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  className: "toast-root",
                  descriptionClassName: "toast-desc",
                  duration: 3000,
                }}
              />
            </AuthProvider>
          </QueryProvider>
        </AuthErrorBoundary>
      </body>
    </html>
  );
}
