import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ActiveOutbreakBanner: React.FC = () => {
    return (
        <div className="bg-destructive text-destructive-foreground overflow-hidden py-2 relative flex items-center shadow-md">
            <div className="absolute left-0 top-0 bottom-0 bg-destructive z-10 px-4 flex items-center shadow-[10px_0_15px_-5px_rgba(212,24,61,1)]">
                <AlertCircle className="h-5 w-5 mr-2 animate-pulse" />
                <span className="font-bold whitespace-nowrap uppercase tracking-wider text-sm">Active Alerts</span>
            </div>
            <div className="flex-1 overflow-hidden ml-32 sm:ml-40">
                <div className="animate-scroll-text inline-block whitespace-nowrap pl-[100%] pr-[20%]">
                    <span className="mx-4 font-semibold">⚠️ KANO MUNICIPAL:</span> High risk of Lassa Fever detected due to recent hotspot activity.
                    <span className="mx-4 font-semibold">⚠️ LAGOS MAINLAND:</span> Increased Malaria risk due to recent heavy rainfall (45mm).
                    <span className="text-destructive-foreground/80 ml-8 text-sm italic">Sabi Health predictive models updated 10 mins ago.</span>
                </div>
            </div>
        </div>
    );
};
