import { useEffect, useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

type ClockInfo = {
    date: string;
    time: string;
    zone: string;
};

function getClockInfo(): ClockInfo {
    const now = new Date();
    const appTimezone = import.meta.env.VITE_APP_TIMEZONE ?? 'UTC';

    const date = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        timeZone: appTimezone,
    }).format(now);

    const timeParts = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: appTimezone,
    }).formatToParts(now);

    const hour = timeParts.find((part) => part.type === 'hour')?.value ?? '00';
    const minute = timeParts.find((part) => part.type === 'minute')?.value ?? '00';
    const second = timeParts.find((part) => part.type === 'second')?.value ?? '00';
    const dayPeriod = timeParts.find((part) => part.type === 'dayPeriod')?.value ?? 'AM';

    // Extract timezone abbreviation from the appTimezone value
    const zone = appTimezone.split('/').pop()?.substring(0, 3).toUpperCase() ?? 'UTC';

    return {
        date,
        time: `${hour} : ${minute} : ${second} ${dayPeriod}`,
        zone,
    };
}

export function HeaderBreadcrumbs({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const [clockInfo, setClockInfo] = useState<ClockInfo>(() => getClockInfo());
    const appVersion = import.meta.env.VITE_APP_VERSION ?? '1.0.0 (Beta)';

    useEffect(() => {
        const timer = window.setInterval(() => {
            setClockInfo(getClockInfo());
        }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, []);

    return (
        <header className="m-4 flex h-12 shrink-0 items-center justify-between rounded-xl border border-border/40 bg-background/40 px-4 shadow-sm backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14 md:px-5">
            <div className="flex items-center">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-3 text-[10px] text-muted-foreground md:gap-4 md:text-xs">
                <div className="hidden items-center gap-1.5 md:flex">
                    <span className="font-medium tracking-tight opacity-50">VERSION</span>
                    <span className="font-bold text-foreground/80">{appVersion}</span>
                </div>
                <span className="hidden opacity-20 md:inline">|</span>
                <div className="flex items-center gap-3">
                    <span className="font-medium tabular-nums">{clockInfo.date}</span>
                    <span className="opacity-20">|</span>
                    <span className="font-bold tabular-nums text-foreground/80">{clockInfo.time}</span>
                </div>
                <span className="hidden rounded-lg bg-amber-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 md:inline-flex">
                    {clockInfo.zone}
                </span>
            </div>
        </header>
    );
}
