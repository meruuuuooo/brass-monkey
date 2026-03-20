import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, CalendarDays, Search, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import ActivityLogController from '@/actions/App/Http/Controllers/Admin/ActivityLogController';
import { DataTableWithPagination } from '@/components/data-table';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
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
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
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

    function toCsvCell(value: string): string {
        return `"${value.replace(/"/g, '""')}"`;
    }

    function exportSelectedAsCsv(selectedLogs: Log[]): void {
        if (selectedLogs.length === 0) {
            return;
        }

        const header = ['Event', 'Description', 'User Name', 'User Email', 'IP Address', 'Date'];
        const rows = selectedLogs.map((log) => [
            log.event,
            log.description,
            log.user?.name ?? '',
            log.user?.email ?? '',
            log.ip_address ?? '',
            new Date(log.created_at).toISOString(),
        ]);

        const csvContent = [
            header.map(toCsvCell).join(','),
            ...rows.map((row) => row.map((cell) => toCsvCell(cell)).join(',')),
        ].join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.setAttribute(
            'download',
            `activity-logs-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    const columns: ColumnDef<Log>[] = useMemo(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <div className="flex w-8 items-center justify-center">
                        <Checkbox
                            checked={
                                table.getIsAllPageRowsSelected() ||
                                (table.getIsSomePageRowsSelected() && 'indeterminate')
                            }
                            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                            aria-label="Select all"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex w-8 items-center justify-center">
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                            aria-label="Select row"
                        />
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: 'event',
                header: ({ column }) => (
                    <div
                        className="flex cursor-pointer select-none items-center space-x-2"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        <span>Event</span>
                        <ArrowUpDown className="h-4 w-4" />
                    </div>
                ),
                cell: ({ row }) => (
                    <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${eventColors[row.original.event] ?? 'bg-muted text-muted-foreground'}`}
                    >
                        {row.original.event}
                    </span>
                ),
            },
            {
                accessorKey: 'description',
                header: 'Description',
                cell: ({ row }) => (
                    <span className="line-clamp-2 text-foreground">{row.original.description}</span>
                ),
            },
            {
                id: 'user',
                header: 'User',
                cell: ({ row }) => {
                    const user = row.original.user;

                    return user ? (
                        <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    );
                },
            },
            {
                accessorKey: 'ip_address',
                header: 'IP Address',
                cell: ({ row }) => (
                    <span className="text-muted-foreground">{row.original.ip_address ?? '-'}</span>
                ),
            },
            {
                accessorKey: 'created_at',
                header: ({ column }) => (
                    <div
                        className="flex cursor-pointer select-none items-center space-x-2"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        <span>Date</span>
                        <ArrowUpDown className="h-4 w-4" />
                    </div>
                ),
                cell: ({ row }) => (
                    <span className="text-muted-foreground">
                        {new Date(row.original.created_at).toLocaleString()}
                    </span>
                ),
            },
        ],
        [],
    );

    const renderGridItem = (log: Log) => (
        <div className="h-full rounded-lg border bg-card p-4 transition-all hover:shadow-md">
            <div className="mb-3 flex items-center justify-between gap-2">
                <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${eventColors[log.event] ?? 'bg-muted text-muted-foreground'}`}
                >
                    {log.event}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(log.created_at).toLocaleDateString()}
                </span>
            </div>

            <p className="line-clamp-3 text-sm text-foreground">{log.description}</p>

            <div className="mt-4 space-y-2 border-t pt-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span className="truncate">
                        {log.user ? `${log.user.name} (${log.user.email})` : '-'}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground">IP: {log.ip_address ?? '-'}</p>
            </div>
        </div>
    );

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

            <div className="space-y-6 p-4 md:p-6 rounded-sm m-4 mt-0 border border-sidebar-border/50 shadow-sm">
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

                <DataTableWithPagination
                    columns={columns}
                    data={logs.data}
                    pagination={logs}
                    emptyMessage="No activity logs found."
                    onPageChange={(url) => router.get(url)}
                    renderGridItem={renderGridItem}
                    bulkActions={[
                        {
                            label: 'Export selected as CSV',
                            onClick: exportSelectedAsCsv,
                        },
                    ]}
                />
            </div>
        </AppLayout>
    );
}
