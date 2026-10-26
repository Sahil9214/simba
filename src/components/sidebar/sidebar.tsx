"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { NAV_ITEMS } from "../navbar/nav-data"
import { PanelLeftOpen, PanelLeftClose, LogOut, Lock, ChevronDown, ChevronRight } from 'lucide-react'
import { useSidebar } from "./sidebar-context"
import { logo } from "@/assets/icons"
import Image from "next/image"
import { useState } from "react"
import { showToast } from "../ui/toast"
import { useSignOut } from "@/hooks/auth/useAuthMutations"
import { LogoutModal } from "../ui/logoutModal"
import { useAuth } from "@/contexts/AuthContext"
import { getInitials } from "@/utils/avatar/get-initials"
import { getColorClasses } from "@/utils/avatar/get-color-classes"

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ")
}

export function Sidebar() {
    const pathname = usePathname()
    const { open, setOpen, collapsed, toggleCollapsed } = useSidebar()
    const [isLogoHovered, setIsLogoHovered] = useState(false)
    const signOutMutation = useSignOut()
    const lockedRoutes = process.env.NEXT_PUBLIC_LOCK_ROUTES === "true"
    const [expandedItems, setExpandedItems] = useState<string[]>([])
    const [logoutModal, setLogoutModal] = useState(false)
    const isExpanded = !collapsed
    const handleCollapseClick = () => {
        toggleCollapsed()
    }

    // Handle logo hover - simple hover without flip
    const handleLogoHover = () => {
        if (collapsed) {
            setIsLogoHovered(true)
        }
    }

    const handleLogoLeave = () => {
        setIsLogoHovered(false)
    }
    const handleLogout = () => {
        signOutMutation.mutate()
    }

    const toggleExpand = (href: string) => {
        setExpandedItems(prev =>
            prev.includes(href)
                ? prev.filter(item => item !== href)
                : [...prev, href]
        )
    }

    // Helper function to check if parent item should be active
    const isParentActive = (item: any) => {
        // If exact match with parent route
        if (pathname === item.href) {
            return true
        }

        // If item has children, only activate parent if no child is active
        if (item.children && item.children.length > 0) {
            const isChildActive = item.children.some((child: any) =>
                pathname === child.href || pathname?.startsWith(child.href)
            )
            return false // Don't activate parent if child is active
        }

        // For items without children, use startsWith logic
        return item.href !== "/dashboard" && pathname?.startsWith(item.href)
    }

    // Helper function to check if child item should be active
    const isChildActive = (childHref: string) => {
        return pathname === childHref || pathname?.startsWith(childHref)
    }
    const { user } = useAuth();
    const initials = getInitials(user?.user_metadata?.first_name, user?.user_metadata?.last_name, user?.email);
    const colorClasses = getColorClasses(initials[0]);
    return (
        <>
            {/* Mobile overlay */}
            <div
                aria-hidden={!open}
                onClick={() => setOpen(false)}
                className={cn(
                    "fixed font-inter inset-0 z-40 bg-black/50 md:hidden",
                    "transition-opacity duration-300 ease-in-out will-change-opacity",
                    open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
                )}
            />

            <aside
                className={cn(
                    "group/aside fixed md:sticky top-0 left-0 h-full bg-white border-r border-[#E1E7EF] flex flex-col",
                    "transition-all duration-300 ease-in-out will-change-transform",
                    "touch-none md:touch-auto",
                    open ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0",
                    collapsed ? "md:w-20" : "md:w-64",
                    "z-50 md:z-auto",
                    "shadow-lg md:shadow-none"
                )}
                aria-label="Sidebar navigation"
            >
                <div className={cn(
                    "flex items-center h-14 border-b border-gray-200 transition-all duration-300 ease-in-out",
                    isExpanded ? "gap-2 px-3" : "justify-center"
                )}>
                    {/* Logo with simple hover effect */}
                    <div
                        className="relative"
                        onMouseEnter={handleLogoHover}
                        onMouseLeave={handleLogoLeave}
                    >
                        <Image
                            src={logo}
                            alt="Simba logo"
                            width={24}
                            height={24}
                            className="transition-all duration-200 ease-in-out"
                        />

                        {/* Expand button that appears immediately on hover when collapsed */}
                        {collapsed && isLogoHovered && (
                            <button
                                type="button"
                                className="absolute right-0 top-1/2 -translate-y-1/2 inline-flex items-center justify-center size-8  rounded-md bg-white border border-gray-200 shadow-lg  hover:bg-gray-50 transition-all duration-200 z-20 cursor-pointer"
                                aria-label="Expand sidebar"
                                title="Expand sidebar"
                                onClick={handleCollapseClick}
                            >
                                <PanelLeftOpen className="size-4" />
                            </button>
                        )}
                    </div>

                    <div className={cn(
                        "flex-1 min-w-0 transition-all duration-300 ease-in-out overflow-hidden",
                        !isExpanded ? "hidden opacity-0" : "block opacity-100"
                    )}>
                        <span className="block text-sm font-medium text-primary truncate">Simba<span className="text-black">Analytics</span></span>
                    </div>
                    {/* Mobile close button - only show when sidebar is open on mobile */}
                    {open && (
                        <button
                            type="button"
                            className="md:hidden inline-flex items-center justify-center size-8 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer "
                            aria-label="Close sidebar"
                            onClick={() => setOpen(false)}
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="text-gray-600 "
                            >
                                <path
                                    d="M12 4L4 12M4 4L12 12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    )}

                    {/* Desktop collapse button - only show when expanded */}
                    {isExpanded && (
                        // ✅ GOOD
                        <button
                            onClick={handleCollapseClick}
                            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                            aria-expanded={!collapsed}
                            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                            className="cursor-pointer hidden lg:block"
                        >
                            {collapsed ?
                                <PanelLeftOpen className="w-5 h-5" aria-hidden="true" /> :
                                <PanelLeftClose className="w-5 h-5" aria-hidden="true" />
                            }
                        </button>
                    )}
                </div>

                <nav className="px-2 md:px-3 py-4 space-y-1 overflow-y-auto flex-1 min-h-0 scrollbar-custom touch-pan-y">
                    {NAV_ITEMS.map((item) => {
                        const isActive = isParentActive(item)
                        const isLocked = lockedRoutes && (item.label === "Risk & Alerts" || item.label === "Report History")
                        const ItemIcon = isLocked ? Lock : item.icon
                        const hasChildren = item.children && item.children.length > 0
                        const isItemExpanded = expandedItems.includes(item.href)

                        const handleClick = (e: React.MouseEvent) => {
                            if (isLocked) {
                                e.preventDefault()
                                showToast("warning", "You cannot access this route.")
                            } else if (hasChildren) {
                                // Toggle dropdown for items with children
                                toggleExpand(item.href)

                                // Don't prevent navigation - allow both dropdown toggle and navigation
                                setOpen(false)
                            } else {
                                setOpen(false)
                            }
                        }

                        return (
                            <div key={item.href} className={cn(
                                "flex flex-col rounded-lg",
                            )}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 h-10 rounded-lg transition-all px-2 mx-2",
                                        isActive ? "bg-secondary text-primary font-semibold" : " text-sidebar-foreground font-normal hover:bg-gray-100 active:bg-gray-200",
                                        !isExpanded ? "md:justify-center" : "justify-start",
                                        isLocked && "opacity-60 cursor-not-allowed"
                                    )}
                                    aria-current={isActive ? "page" : undefined}
                                    onClick={handleClick}
                                >
                                    <ItemIcon
                                        className={cn(
                                            "transition-all duration-300",
                                            !isExpanded ? "w-5 h-5" : "w-4 h-4",
                                            isActive ? "text-primary font-semibold" : "text-sidebar-foreground"
                                        )}
                                        strokeWidth={1.5}
                                    />
                                    <span
                                        className={cn(
                                            "text-sm transition-all duration-300 ease-in-out whitespace-nowrap",
                                            isActive ? "font-semibold" : "font-normal",
                                            !isExpanded ? "hidden opacity-0" : "inline opacity-100",
                                        )}
                                    >
                                        {item.label}
                                    </span>
                                    {hasChildren && isExpanded && (
                                        <div className="ml-auto">
                                            {isItemExpanded ?
                                                <ChevronDown className={cn(
                                                    "size-4",
                                                    ""
                                                )} strokeWidth={1.5} /> :
                                                <ChevronRight className={cn(
                                                    "size-4",
                                                    ""
                                                )} strokeWidth={1.5} />
                                            }
                                        </div>
                                    )}
                                </Link>

                                {/* Dropdown items */}
                                {hasChildren && isItemExpanded && isExpanded && (
                                    <div className={cn(
                                        "px-4 py-1 pb-2 ml-6 transition-all duration-200 ease-in-out"
                                    )}>
                                        {item.children?.map(child => {
                                            const childActive = isChildActive(child.href)

                                            return (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    className={cn(
                                                        "flex items-center h-8 rounded-lg transition-all px-2",
                                                        childActive ? "bg-secondary text-primary font-semibold" : "text-charcoal-black text-sm font-normal hover:bg-gray-100",
                                                    )}
                                                    onClick={() => setOpen(false)}
                                                >
                                                    <span className={cn(
                                                        "text-sm",
                                                        childActive ? "font-semibold" : "font-normal"
                                                    )}>
                                                        {child.label}
                                                    </span>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </nav>
                <div className={cn(
                    "border-t border-gray-200 flex items-center justify-between gap-2 px-2 md:px-3 py-4 shrink-0 transition-all duration-300 ease-in-out",
                    !isExpanded ? "flex-col" : "flex-row"
                )}>
                    <div className={`rounded-full h-8 w-8 p-2 flex items-center justify-center ${colorClasses} ${!isExpanded ? "mx-auto" : ""}`}>
                        <span className="text-xl font-semibold text-white">{initials}</span>
                    </div>
                    <button
                        type="button"
                        className={cn(
                            "flex flex-row items-center py-2 px-2 gap-2 rounded-lg transition-all duration-200 hover:bg-gray-100 active:bg-gray-200 active:scale-95 w-full cursor-pointer",
                            !isExpanded ? "md:justify-center w-full md:w-auto" : "justify-start w-full"
                        )}
                        onClick={() => setLogoutModal(true)}
                    >
                        <LogOut
                            className={cn(
                                "transition-all duration-300 ",
                                "w-4 h-4",
                                "text-primary"
                            )}
                        />
                        <span
                            className={cn(
                                "text-sm leading-normal font-normal text-primary transition-all duration-300 ease-in-out whitespace-nowrap",
                                !isExpanded ? "md:hidden opacity-0" : "inline opacity-100"
                            )}
                        >
                            Logout
                        </span>
                    </button>
                </div>
            </aside>
            {logoutModal && (
                <LogoutModal onClose={() => setLogoutModal(false)} onLogout={handleLogout} />
            )}
        </>
    )
}
