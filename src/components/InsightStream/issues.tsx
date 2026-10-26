import { AlertTriangle, CheckCircle2, Info, Truck, Trophy } from 'lucide-react';
import React from 'react'

const Issues = (props: any) => {
    const Icon = pickIcon(props.variant);
    return (
        <div className={`flex items-center gap-3 px-3 py-2 rounded-md bg-gray-50 ${props.iconColor}`}>
            <Icon className={`w-5 h-5 ${props.iconColor}`} />
            <p className='text-sm text-[#364153]'>{props.text}</p>

        </div>

    )
}

export default Issues;



function pickIcon(variant: string) {
    switch (variant) {
        case "success":
            return (props: any) => <CheckCircle2 aria-label='success' {...props} />;
        case "info":
            return (props: any) => <Info aria-label='info' {...props} />;
        case "warning":
            return (props: any) => <AlertTriangle aria-label='warning' {...props} />;
        case "critical":
            return (props: any) => <AlertTriangle aria-label='critical' {...props} />;
        case "caution":
            return (props: any) => <Truck aria-label='caution' {...props} />;
        case "neutral":
        default:
            return (props: any) => <Trophy aria-label='neutral' {...props} />;
    }
}