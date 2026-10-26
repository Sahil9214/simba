"use client"

import type { ReactNode } from "react"
import "@/app/globals.css"
import { SidebarProvider } from "@/components/sidebar/sidebar-context"
import { Sidebar } from "@/components/sidebar/sidebar"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { simba_background } from "@/assets/image"
import { UserRole } from "@/lib/rbac"

function DashboardLayoutContent({ children }: { children: ReactNode }) {
    return (
        <div className="md:h-full lg:h-screen  bg-tertiary-color relative">
            {/* Background image with 19% opacity */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `url(${simba_background})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.19,
                    zIndex: 0, // Ensure it's behind the content
                }}
            />

            <div className="relative z-10 flex h-full ">
                <section className="bg-white"
                    aria-label="Main navigation"
                >
                    <Sidebar />
                </section>
                {/* Main column */}
                <div
                    className="flex-1  h-screen flex flex-col min-w-0">
                    <main
                        id="main-content"
                        className="flex-1 px-4 py-4 overflow-y-auto scrollbar-gutter-stable"
                        role="main"
                        aria-label="Main content"
                        tabIndex={-1}
                    >
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute requireAuth={true} blockRoles={[UserRole.STAFF]}>
            <SidebarProvider>
                <DashboardLayoutContent>{children}</DashboardLayoutContent>
            </SidebarProvider>
        </ProtectedRoute>
    )
}
