import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    ArrowUpDown,
    CalendarDays,
    Search,
    User,
    Filter,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import ActivityLogController from '@/actions/App/Http/Controllers/Admin/ActivityLogController';
import { DataTableWithPagination } from '@/components/data-table';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
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
    subject_type: string | null;
    subject_id: number | null;
    properties: Record<string, unknown> | null;
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
    filters: {
        search?: string;
        event?: string;
        user_id?: string;
        subject_type?: string;
        date_from?: string;
        date_to?: string;
    };
    events: string[];
    subjectTypes: string[];
    users: Array<{ id: number; name: string; email: string }>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Activity Logs', href: ActivityLogController.index.url() },
];

const eventColors: Record<string, string> = {
    login: 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40',
    logout: 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40',
    created:
        'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/40',
    updated:
        'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/40',
    deleted: 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/40',
    activated:
        'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/40',
    deactivated:
        'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900/40',
    // Order events
    order_created:
        'text-indigo-700 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/40',
    order_status_changed:
        'text-sky-700 bg-sky-100 dark:text-sky-300 dark:bg-sky-900/40',
    order_refunded:
        'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/40',
    order_cancelled:
        'text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/40',
    // Service events
    service_job_created:
        'text-violet-700 bg-violet-100 dark:text-violet-300 dark:bg-violet-900/40',
    service_job_updated:
        'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/40',
    service_note_added:
        'text-teal-700 bg-teal-100 dark:text-teal-300 dark:bg-teal-900/40',
    // Purchase order events
    purchase_order_created:
        'text-cyan-700 bg-cyan-100 dark:text-cyan-300 dark:bg-cyan-900/40',
    purchase_order_status_changed:
        'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40',
    purchase_order_deleted:
        'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900/40',
    // Stock events
    stock_adjusted:
        'text-lime-700 bg-lime-100 dark:text-lime-300 dark:bg-lime-900/40',
};

const subjectTypeLabels: Record<string, string> = {
    Order: 'Orders',
    ServiceJob: 'Service Jobs',
    PurchaseOrder: 'Purchase Orders',
    StockAdjustment: 'Stock Adjustments',
};

function getSubjectRef(log: Log): string | null {
    if (!log.properties || !log.subject_type) return null;
    const props = log.properties as Record<string, string>;
    if (props.order_number) return props.order_number;
    if (props.tracking_number) return props.tracking_number;
    if (props.sku) return `${props.product ?? ''} (${props.sku})`;
    return null;
}

export default function ActivityLogs({
    logs,
    filters,
    events,
    subjectTypes,
    users,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const hasActiveFilters = !!(
        filters.event ||
        filters.user_id ||
        filters.subject_type ||
        filters.date_from ||
        filters.date_to ||
        filters.search
    );

    function toCsvCell(value: string): string {
        return `"${value.replace(/"/g, '""')}"`;
    }

    function exportSelectedAsCsv(selectedLogs: Log[]): void {
        if (selectedLogs.length === 0) return;

        const header = [
            'Event',
            'Description',
            'Subject',
            'User Name',
            'User Email',
            'IP Address',
            'Date',
        ];
        const rows = selectedLogs.map((log) => [
            log.event,
            log.description,
            getSubjectRef(log) ?? '',
            log.user?.name ?? '',
            log.user?.email ?? '',
            log.ip_address ?? '',
            new Date(log.created_at).toISOString(),
        ]);

        const csvContent = [
            header.map(toCsvCell).join(','),
            ...rows.map((row) => row.map((cell) => toCsvCell(cell)).join(',')),
        ].join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], {
            type: 'text/csv;charset=utf-8;',
        });
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
                                (table.getIsSomePageRowsSelected() &&
                                    'indeterminate')
                            }
                            onCheckedChange={(value) =>
                                table.toggleAllPageRowsSelected(!!value)
                            }
                            aria-label="Select all"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex w-8 items-center justify-center">
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) =>
                                row.toggleSelected(!!value)
                            }
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
                        className="flex cursor-pointer items-center space-x-2 select-none"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                    >
                        <span>Event</span>
                        <ArrowUpDown className="h-4 w-4" />
                    </div>
                ),
                cell: ({ row }) => (
                    <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${eventColors[row.original.event] ?? 'bg-muted text-muted-foreground'}`}
                    >
                        {row.original.event.replace(/_/g, ' ')}
                    </span>
                ),
            },
            {
                accessorKey: 'description',
                header: 'Description',
                cell: ({ row }) => (
                    <span className="line-clamp-2 text-foreground">
                        {row.original.description}
                    </span>
                ),
            },
            {
                id: 'subject',
                header: 'Subject',
                cell: ({ row }) => {
                    const ref = getSubjectRef(row.original);
                    const type = row.original.subject_type;

                    if (!type)
                        return <span className="text-muted-foreground">—</span>;
                    return (
                        <div className="flex flex-col gap-0.5">
                            <Badge
                                variant="outline"
                                className="w-fit text-[10px] font-bold tracking-wider uppercase"
                            >
                                {type.replace(/([A-Z])/g, ' $1').trim()}
                            </Badge>
                            {ref && (
                                <span className="font-mono text-xs font-semibold text-foreground">
                                    {ref}
                                </span>
                            )}
                        </div>
                    );
                },
            },
            {
                id: 'user',
                header: 'User',
                cell: ({ row }) => {
                    const user = row.original.user;

                    return user ? (
                        <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {user.email}
                            </p>
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
                    <span className="text-muted-foreground">
                        {row.original.ip_address ?? '-'}
                    </span>
                ),
            },
            {
                accessorKey: 'created_at',
                header: ({ column }) => (
                    <div
                        className="flex cursor-pointer items-center space-x-2 select-none"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
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

    const renderGridItem = (log: Log) => {
        const ref = getSubjectRef(log);

        return (
            <div className="h-full rounded-lg border bg-card p-4 transition-all hover:shadow-md">
                <div className="mb-3 flex items-center justify-between gap-2">
                    <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${eventColors[log.event] ?? 'bg-muted text-muted-foreground'}`}
                    >
                        {log.event.replace(/_/g, ' ')}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(log.created_at).toLocaleDateString()}
                    </span>
                </div>

                {log.subject_type && (
                    <div className="mb-2 flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className="text-[10px] font-bold tracking-wider uppercase"
                        >
                            {log.subject_type.replace(/([A-Z])/g, ' $1').trim()}
                        </Badge>
                        {ref && (
                            <span className="font-mono text-xs font-semibold">
                                {ref}
                            </span>
                        )}
                    </div>
                )}

                <p className="line-clamp-3 text-sm text-foreground">
                    {log.description}
                </p>

                <div className="mt-4 space-y-2 border-t pt-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span className="truncate">
                            {log.user
                                ? `${log.user.name} (${log.user.email})`
                                : '-'}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        IP: {log.ip_address ?? '-'}
                    </p>
                </div>
            </div>
        );
    };

    function applyFilters(overrides: Record<string, string | undefined>) {
        const nextFilters: Record<string, string | undefined> = {
            search: search || undefined,
            event: filters.event || undefined,
            user_id: filters.user_id || undefined,
            subject_type: filters.subject_type || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            ...overrides,
        };

        router.get(ActivityLogController.index.url(), nextFilters, {
            preserveState: true,
            replace: true,
        });
    }

    function clearAllFilters() {
        setSearch('');
        setDateFrom('');
        setDateTo('');
        router.get(
            ActivityLogController.index.url(),
            {},
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

            <div className="m-4 mt-0 space-y-6 rounded-sm border border-sidebar-border/50 p-4 shadow-sm md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Activity Logs"
                        description="Track all user activity, transactions, and system events"
                    />
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <X className="size-3.5" /> Clear filters
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <form
                            onSubmit={handleSearch}
                            className="flex flex-1 gap-2"
                        >
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                                applyFilters({
                                    event: v === 'all' ? undefined : v,
                                })
                            }
                        >
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="All events" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All events</SelectItem>
                                {events.map((event) => (
                                    <SelectItem key={event} value={event}>
                                        <span className="capitalize">
                                            {event.replace(/_/g, ' ')}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.subject_type ?? 'all'}
                            onValueChange={(v) =>
                                applyFilters({
                                    subject_type: v === 'all' ? undefined : v,
                                })
                            }
                        >
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                {subjectTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {subjectTypeLabels[type] ?? type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.user_id ?? 'all'}
                            onValueChange={(v) =>
                                applyFilters({
                                    user_id: v === 'all' ? undefined : v,
                                })
                            }
                        >
                            <SelectTrigger className="w-full sm:w-64">
                                <SelectValue placeholder="All users" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All users</SelectItem>
                                {users.map((user) => (
                                    <SelectItem
                                        key={user.id}
                                        value={String(user.id)}
                                    >
                                        {user.name} ({user.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Filter className="size-3.5" />
                            <span className="font-medium">Date range:</span>
                        </div>
                        <Input
                            type="date"
                            className="w-full sm:w-40"
                            value={dateFrom}
                            onChange={(e) => {
                                setDateFrom(e.target.value);
                                applyFilters({
                                    date_from: e.target.value || undefined,
                                });
                            }}
                            placeholder="From"
                        />
                        <span className="hidden text-muted-foreground sm:inline">
                            to
                        </span>
                        <Input
                            type="date"
                            className="w-full sm:w-40"
                            value={dateTo}
                            onChange={(e) => {
                                setDateTo(e.target.value);
                                applyFilters({
                                    date_to: e.target.value || undefined,
                                });
                            }}
                            placeholder="To"
                        />
                    </div>
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
