"use client"

import type React from "react"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"

type SidebarContextType = {
    open: boolean
    setOpen: (v: boolean) => void
    toggle: () => void
    collapsed: boolean
    setCollapsed: (v: boolean) => void
    toggleCollapsed: () => void
    isHovered: boolean
    setIsHovered: (v: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const pathname = usePathname()

    // Close drawer on route change (mobile usability) with smooth transition
    useEffect(() => {
        // Use requestAnimationFrame to ensure smooth transition
        const timer = requestAnimationFrame(() => {
            setOpen(false)
        })
        return () => cancelAnimationFrame(timer)
    }, [pathname])

    // Lock body scroll on mobile when sidebar is open
    useEffect(() => {
        if (open && typeof window !== 'undefined') {
            // Only lock scroll on mobile devices (screen width < 768px)
            const isMobile = window.innerWidth < 768
            if (isMobile) {
                const originalStyle = window.getComputedStyle(document.body).overflow
                document.body.style.overflow = 'hidden'
                return () => {
                    document.body.style.overflow = originalStyle
                }
            }
        }
    }, [open])

    // Swipe gestures disabled - using dedicated button instead for better UX

    // Hydrate collapsed from localStorage and persist changes (desktop only enhancement)
    useEffect(() => {
        try {
            const saved = localStorage.getItem("sidebar:collapsed")
            if (saved != null) setCollapsed(saved === "1")
        } catch { }
    }, [])
    useEffect(() => {
        try {
            localStorage.setItem("sidebar:collapsed", collapsed ? "1" : "0")
        } catch { }
    }, [collapsed])

    const toggle = useCallback(() => setOpen((p) => !p), [])
    const toggleCollapsed = useCallback(() => setCollapsed((p) => !p), [])

    const value = useMemo(
        () => ({
            open,
            setOpen,
            toggle,
            collapsed,
            setCollapsed,
            toggleCollapsed,
            isHovered,
            setIsHovered
        }),
        [open, toggle, collapsed, toggleCollapsed, isHovered],
    )

    return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
    const ctx = useContext(SidebarContext)
    if (!ctx) {
        throw new Error("useSidebar must be used within SidebarProvider")
    }
    return ctx
}