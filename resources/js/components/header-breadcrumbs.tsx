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

    const date = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(now);

    const timeParts = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'short',
    }).formatToParts(now);

    const hour = timeParts.find((part) => part.type === 'hour')?.value ?? '00';
    const minute = timeParts.find((part) => part.type === 'minute')?.value ?? '00';
    const second = timeParts.find((part) => part.type === 'second')?.value ?? '00';
    const dayPeriod = timeParts.find((part) => part.type === 'dayPeriod')?.value ?? 'AM';
    const zone = timeParts.find((part) => part.type === 'timeZoneName')?.value ?? 'UTC';

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
        <header className="m-4 flex h-10 shrink-0 shadow-sm items-center justify-between rounded-sm border border-sidebar-border/50 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
            <div className="flex items-center">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="hidden items-center gap-3 text-xs text-muted-foreground md:flex">
                <span className="italic">Current Version : {appVersion}</span>
                <span>|</span>
                <span>{clockInfo.date}</span>
                <span>|</span>
                <span>{clockInfo.time}</span>
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                    {clockInfo.zone}
                </span>
            </div>
        </header>
    );
}
