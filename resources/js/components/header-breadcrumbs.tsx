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
        <header className="m-4 flex h-10 shrink-0 items-center justify-between border border-sidebar-border/50 px-4 shadow-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
            <div className="flex items-center">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-2 text-[10px] text-muted-foreground md:gap-3 md:text-xs">
                <span className="hidden italic md:inline">Current Version : {appVersion}</span>
                <span className="hidden md:inline">|</span>
                <span>{clockInfo.date}</span>
                <span>|</span>
                <span>{clockInfo.time}</span>
                <span className="hidden rounded-full bg-sky-100 px-2 py-0.5 text-sky-700 dark:bg-sky-950 dark:text-sky-300 md:inline-flex">
                    {clockInfo.zone}
                </span>
            </div>
        </header>
    );
}
