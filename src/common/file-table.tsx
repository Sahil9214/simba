"use client"

import type React from "react"
import { useMemo, useState } from "react"
function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ")
}


type Status = "Processed" | "Failed" | "Processing"
type FileType = "Excel File" | "Word Document" | "PDF File"

export type FileRow = {
    id: string
    name: string
    type: FileType
    country: string
    role: string
    date: string // dd/mm/yyyy
    status: Status
}


const PAGE_SIZE = 5

export default function FilesTable({ initialData }: { initialData: FileRow[] }) {
    const [query, setQuery] = useState("")
    const [type, setType] = useState<FileType | "All">("All")
    const [status, setStatus] = useState<Status | "All">("All")
    const [page, setPage] = useState(1)

    const data = useMemo(() => {
        const q = query.trim().toLowerCase()
        let rows = initialData.filter((r) => (q ? r.name.toLowerCase().includes(q) : true))
        if (type !== "All") rows = rows.filter((r) => r.type === type)
        if (status !== "All") rows = rows.filter((r) => r.status === status)
        return rows
    }, [initialData, query, type, status])

    const pageCount = Math.max(1, Math.ceil(data.length / PAGE_SIZE))
    const current = Math.min(page, pageCount)
    const start = (current - 1) * PAGE_SIZE
    const paged = data.slice(start, start + PAGE_SIZE)

    function goTo(p: number) {
        setPage(Math.min(Math.max(1, p), pageCount))
    }

    return (
        <div className="rounded-2xl border border-gray-200 p-4 shadow-sm">
            {/* Functional toolbar */}
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-3">
                    <div className="flex h-11 w-full max-w-md items-center gap-2 rounded-2xl border border-gray-200 px-3">
                        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="text-gray-500">
                            <path
                                d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                        </svg>
                        <input
                            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
                            placeholder="Search"
                            aria-label="Search files"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value)
                                setPage(1)
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <FilterPill>
                            <span className="text-sm font-medium text-gray-800">File Type</span>
                            <select
                                aria-label="Filter by file type"
                                className="bg-transparent text-sm outline-none"
                                value={type}
                                onChange={(e) => {
                                    setType(e.target.value as any)
                                    setPage(1)
                                }}
                            >
                                <option>All</option>
                                <option>Excel File</option>
                                <option>Word Document</option>
                                <option>PDF File</option>
                            </select>
                            <Chevron />
                        </FilterPill>

                        <FilterPill>
                            <span className="text-sm font-medium text-gray-800">By Status</span>
                            <select
                                aria-label="Filter by status"
                                className="bg-transparent text-sm outline-none"
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value as any)
                                    setPage(1)
                                }}
                            >
                                <option>All</option>
                                <option>Processed</option>
                                <option>Processing</option>
                                <option>Failed</option>
                            </select>
                            <Chevron />
                        </FilterPill>

                        <FilterPill>
                            <span className="text-sm font-medium text-gray-800">Date Range</span>
                            <span className="text-sm text-gray-600">All Time</span>
                            <Chevron />
                        </FilterPill>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full table-fixed border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-700">
                            <Th className="w-10">
                                <input type="checkbox" aria-label="Select all" className="size-4 rounded border-gray-300" />
                            </Th>
                            <Th>File Name</Th>
                            <Th className="w-44">File Type</Th>
                            <Th className="w-[220px]">Uploaded By</Th>
                            <Th className="w-40 hidden md:table-cell">Upload Date</Th>
                            <Th className="w-40">Status</Th>
                            <Th className="w-16 hidden sm:table-cell">Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {paged.map((row, idx) => (
                            <tr key={row.id} className={cn("border-b border-gray-200", idx % 2 === 1 && "bg-gray-50")}>
                                <Td className="align-middle">
                                    <input type="checkbox" aria-label={`Select ${row.name}`} className="size-4 rounded border-gray-300" />
                                </Td>

                                <Td>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-balance text-base font-medium text-gray-900">{row.name}</span>
                                        {/* Mobile-only secondary line */}
                                        <div className="flex items-center gap-2 md:hidden">
                                            <TypeBadge type={row.type} />
                                            <span className="text-sm text-gray-500">{row.date}</span>
                                        </div>
                                    </div>
                                </Td>

                                <Td>
                                    <TypeBadge type={row.type} />
                                </Td>

                                <Td>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="flex size-12 items-center justify-center rounded-full bg-gray-100 text-base font-semibold text-gray-700"
                                            aria-hidden="true"
                                        >
                                            {row.country}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-base font-medium">{row.role}</p>
                                            <p className="truncate text-sm text-gray-500">{row.country}</p>
                                        </div>
                                    </div>
                                </Td>

                                <Td className="hidden md:table-cell">{row.date}</Td>

                                <Td>
                                    <StatusBadge status={row.status} />
                                </Td>

                                <Td className="hidden sm:table-cell">
                                    <button
                                        aria-label="More actions"
                                        className="inline-flex size-9 items-center justify-center rounded-full hover:bg-gray-100"
                                    >
                                        <span className="sr-only">Open actions</span>
                                        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="text-gray-700">
                                            <circle cx="5" cy="12" r="1.5" fill="currentColor" />
                                            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                                            <circle cx="19" cy="12" r="1.5" fill="currentColor" />
                                        </svg>
                                    </button>
                                </Td>
                            </tr>
                        ))}

                        {paged.length === 0 && (
                            <tr>
                                <Td colSpan={7}>
                                    <p className="py-10 text-center text-sm text-gray-500">No results found.</p>
                                </Td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
                <Pagination page={current} pageCount={pageCount} onChange={goTo} />
                <p className="text-sm text-gray-600">
                    Showing {start + 1}–{Math.min(start + PAGE_SIZE, data.length)} of {data.length}
                </p>
            </div>
        </div>
    )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <th
            className={cn("sticky top-0 z-10 border-b border-gray-200 px-3 py-3 text-sm font-semibold", className)}
            scope="col"
        >
            {children}
        </th>
    )
}

function Td({ children, className, colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
    return (
        <td className={cn("px-3 py-5 align-top text-gray-900", className)} colSpan={colSpan}>
            {children}
        </td>
    )
}

function FilterPill({ children }: { children: React.ReactNode }) {
    return <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-3 py-2">{children}</div>
}

function Chevron() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="text-gray-600">
            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function TypeBadge({ type }: { type: FileType }) {
    const icon = (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="text-orange-600">
            <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" fill="currentColor" opacity=".1" />
            <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
    )
    return (
        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
            {icon}
            {type}
        </span>
    )
}

function StatusBadge({ status }: { status: Status }) {
    const styles =
        status === "Processed"
            ? "bg-green-600/10 text-green-700 ring-green-600/20"
            : status === "Failed"
                ? "bg-red-600/10 text-red-700 ring-red-600/20"
                : "bg-yellow-500/10 text-yellow-700 ring-yellow-500/20"

    const icon =
        status === "Processed" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path
                    d="M20 6l-11 11L4 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ) : status === "Failed" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path
                    d="M12 4v2m0 12v2m8-8h-2M6 12H4m13.657 6.657l-1.414-1.414M7.757 7.757L6.343 6.343m10.9 0l-1.414 1.414M7.757 16.243 6.343 17.657"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        )

    return (
        <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ring-1", styles)}>
            {icon}
            {status}
        </span>
    )
}

function Pagination({
    page,
    pageCount,
    onChange,
}: {
    page: number
    pageCount: number
    onChange: (p: number) => void
}) {
    if (pageCount <= 1) return null
    const pages = getPaginationRange(page, pageCount)
    return (
        <nav className="flex items-center gap-2" aria-label="Pagination">
            <button
                onClick={() => onChange(page - 1)}
                disabled={page === 1}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        d="M15 19l-7-7 7-7"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                Previous
            </button>

            {pages.map((p, i) =>
                p === "…" ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
                        …
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onChange(Number(p))}
                        aria-current={p === page ? "page" : undefined}
                        className={cn(
                            "inline-flex size-9 items-center justify-center rounded-xl text-sm font-semibold",
                            p === page ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200" : "text-gray-700 hover:bg-gray-100",
                        )}
                    >
                        {p}
                    </button>
                ),
            )}

            <button
                onClick={() => onChange(page + 1)}
                disabled={page === pageCount}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </nav>
    )
}

function getPaginationRange(current: number, total: number) {
    // returns [1, current-1..current..current+1, '…', total]
    const range: (number | "…")[] = []
    const siblings = 1
    const start = Math.max(1, current - siblings)
    const end = Math.min(total, current + siblings)

    range.push(1)
    if (start > 2) range.push("…")
    for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== total) range.push(i)
    }
    if (end < total - 1) range.push("…")
    if (total > 1) range.push(total)

    return range.filter((v, idx) => range.indexOf(v) === idx)
}
