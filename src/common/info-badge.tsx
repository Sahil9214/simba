export function InfoBadge({ text }: { text: string }) {
    return (
        <span className="relative right-0 top-[2px] group inline-flex items-center justify-center align-middle ml-2">
            <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.5 15V11M11.5 7H11.51M21.5 11C21.5 16.5228 17.0228 21 11.5 21C5.97715 21 1.5 16.5228 1.5 11C1.5 5.47715 5.97715 1 11.5 1C17.0228 1 21.5 5.47715 21.5 11Z" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div
                role="tooltip"
                className="pointer-events-none absolute -left-80 top-1/2 ml-2 w-[300px] -translate-y-1/2 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 shadow-sm opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            >
                {text}
            </div>
        </span>
    );
}
