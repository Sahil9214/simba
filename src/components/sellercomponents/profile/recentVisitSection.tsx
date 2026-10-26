import { ShopCard } from "@/components/sellercomponents/profile/shopCard";
import { Shop } from "@/lib/types/legacy";

export function RecentVisitsSection({ visits }: { visits: Shop[] }) {
    return (
        <>
            <h2 className="font-inter text-lg font-semibold text-black">Recent Visits</h2>
            {/* Scrollable Shop Cards Container */}
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto mt-4 scrollbar-hide">
                <div className="py-2  flex flex-col gap-4 scrollbar-hide cursor-pointer">
                    {visits.map((visit: Shop) => (
                        < ShopCard key={visit.id} shop={visit} />
                    ))}
                </div>
            </div>
        </>
    );
}