import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import ActivityLogController from '@/actions/App/Http/Controllers/Admin/ActivityLogController';
import type { BreadcrumbItem } from '@/types';

type UserRef = { id: number; name: string; email: string } | null;

type Log = {
    id: number;
    event: string;
    description: string;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    user: UserRef;
    causer: UserRef;
};

type PaginatedLogs = {
    data: Log[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    logs: PaginatedLogs;
    filters: { search?: string; event?: string };
    events: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Activity Logs', href: ActivityLogController.index.url() },
];

const eventColors: Record<string, string> = {
    login: 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40',
    logout: 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40',
    created: 'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/40',
    updated: 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/40',
    deleted: 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/40',
    activated: 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/40',
    deactivated: 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900/40',
};

export default function ActivityLogs({ logs, filters, events }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilters(overrides: Record<string, string | undefined>) {
        router.get(
            ActivityLogController.index.url(),
            { search: search || undefined, ...filters, ...overrides },
            { preserveState: true, replace: true },
        );
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        applyFilters({ search: search || undefined });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Logs" />

            <div className="space-y-6 p-4 md:p-6">
                <Heading
                    title="Activity Logs"
                    description="Track all user activity and system events"
                />

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                placeholder="Search logs…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>

                    <Select
                        value={filters.event ?? 'all'}
                        onValueChange={(v) =>
                            applyFilters({ event: v === 'all' ? undefined : v })
                        }
                    >
                        <SelectTrigger className="w-full sm:w-44">
                            <SelectValue placeholder="All events" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All events</SelectItem>
                            {events.map((event) => (
                                <SelectItem key={event} value={event}>
                                    <span className="capitalize">{event}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="rounded-xl border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium">
                                        Event
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Description
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        User
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        IP Address
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-4 py-10 text-center text-muted-foreground"
                                        >
                                            No activity logs found.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="border-b last:border-0 hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${eventColors[log.event] ?? 'bg-muted text-muted-foreground'}`}
                                                >
                                                    {log.event}
                                                </span>
                                            </td>
                                            <td className="max-w-xs px-4 py-3 text-foreground">
                                                <span className="line-clamp-2">
                                                    {log.description}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {log.user ? (
                                                    <div>
                                                        <p className="font-medium">
                                                            {log.user.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {log.user.email}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {log.ip_address ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {new Date(
                                                    log.created_at,
                                                ).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {logs.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                            {logs.total} total log
                            {logs.total !== 1 ? 's' : ''}
                        </span>
                        <div className="flex gap-1">
                            {logs.links.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url && router.get(link.url)
                                    }
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
