// components/QueryProvider.tsx
"use client";

import React, { useState } from "react";
import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

type Props = {
    children: React.ReactNode;
    dehydratedState?: unknown;
};

export default function QueryProvider({ children }: Props) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 0, // Always consider data stale for instant updates
                        refetchOnWindowFocus: true, // Refetch when user returns to tab
                        refetchOnMount: true, // Refetch when component mounts
                        refetchOnReconnect: true, // Refetch when network reconnects
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>

            {children}
            {/* {process.env.NODE_ENV === "development" && (
                <ReactQueryDevtools initialIsOpen={false} />
            )} */}
        </QueryClientProvider>
    );
}
