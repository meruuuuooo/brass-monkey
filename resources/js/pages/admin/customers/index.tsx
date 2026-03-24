import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
    Search, UserCircle2, Mail, Filter, Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';
import { DataTableWithPagination } from '@/components/data-table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Segment { id: number; name: string; color: string; }

interface Customer {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    email_verified_at: string | null;
    segments: Segment[];
    customer_notes_count: number;
    created_at: string;
}

interface PaginatedCustomers {
    data: Customer[];
    current_page: number; last_page: number; per_page: number; total: number;
    prev_page_url: string | null; next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    customers: PaginatedCustomers;
    segments: Segment[];
    filters: { search?: string; segment?: string };
}

export default function CustomersIndex({ customers, segments, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const columns: ColumnDef<Customer>[] = useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Customer',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-bm-gold/10 flex items-center justify-center">
                        <UserCircle2 className="size-5 text-bm-gold" />
                    </div>
                    <div>
                        <div className="font-semibold">{row.original.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="size-3" />{row.original.email}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'segments',
            header: 'Segments',
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {row.original.segments.length > 0 ? row.original.segments.map((s) => (
                        <Badge key={s.id} variant="outline" className="rounded-lg text-[10px] font-bold" style={{ borderColor: s.color, color: s.color }}>
                            {s.name}
                        </Badge>
                    )) : <span className="text-xs text-muted-foreground">—</span>}
                </div>
            ),
        },
        {
            accessorKey: 'customer_notes_count',
            header: 'Notes',
            cell: ({ row }) => <span className="font-mono text-sm">{row.original.customer_notes_count}</span>,
        },
        {
            accessorKey: 'created_at',
            header: 'Joined',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{new Date(row.original.created_at).toLocaleDateString()}</span>,
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button variant="ghost" size="sm" className="text-xs font-bold text-bm-gold gap-1" asChild>
                        <Link href={`/admin/customers/${row.original.id}`}>
                            <Eye className="size-3" /> View
                        </Link>
                    </Button>
                </div>
            ),
        },
    ], []);

    const handleSearch = () => {
        router.get('/admin/customers', { ...filters, search: search || undefined }, { preserveState: true, preserveScroll: true });
    };

    const handleFilter = (key: string, value: string | undefined) => {
        router.get('/admin/customers', { ...filters, [key]: value }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Customers', href: '#' }]}>
            <Head title="Customers" />
            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                <Heading title="Customers" description="View and manage all customer accounts." />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-9 rounded-xl border-border/40"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Select value={filters.segment || 'all'} onValueChange={(v) => handleFilter('segment', v === 'all' ? undefined : v)}>
                        <SelectTrigger className="w-[180px] rounded-xl border-border/40">
                            <Filter className="size-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="All Segments" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all" className="rounded-xl">All Segments</SelectItem>
                            {segments.map((s) => (
                                <SelectItem key={s.id} value={s.id.toString()} className="rounded-xl">
                                    <span className="inline-block size-2 rounded-full mr-2" style={{ backgroundColor: s.color }} />
                                    {s.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DataTableWithPagination columns={columns} data={customers.data} pagination={customers} emptyMessage="No customers found." onPageChange={(url) => router.get(url)} />
            </div>
        </AppLayout>
    );
}
