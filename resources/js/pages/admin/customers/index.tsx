import { Head, router, Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Search, UserCircle2, Mail, Filter, Eye, ShieldCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { DataTableWithPagination } from '@/components/data-table';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import AppLayout from '@/layouts/app-layout';

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
    health_status?: 'vip' | 'at_risk' | 'healthy';
    health_score?: number;
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
    filters: { search?: string; segment?: string; health?: string };
}

const healthConfig = {
    vip: { label: 'VIP', color: 'text-bm-gold', bg: 'bg-bm-gold/10', border: 'border-bm-gold/30' },
    healthy: { label: 'Healthy', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    at_risk: { label: 'At Risk', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
} as const;

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
            id: 'health',
            header: 'Health',
            cell: ({ row }) => {
                const s = row.original.health_status;
                if (!s) return null;
                const cfg = healthConfig[s];
                return (
                    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                        <ShieldCheck className="size-3" />{cfg.label}
                    </span>
                );
            },
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

    const renderGridItem = (customer: Customer) => (
        <div className="group relative bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden hover:shadow-md transition-all h-full flex flex-col p-5">
            <div className="flex items-center gap-4 mb-4">
                <div className="size-12 rounded-xl bg-bm-gold/10 flex items-center justify-center shrink-0">
                    <UserCircle2 className="size-6 text-bm-gold" />
                </div>
                <div className="flex-1 min-w-0 pr-8">
                    <h3 className="font-semibold text-lg truncate">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground truncate flex items-center gap-1"><Mail className="size-3" /> {customer.email}</p>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="size-8 rounded-full hover:bg-muted cursor-pointer" asChild>
                        <Link href={`/admin/customers/${customer.id}`}>
                            <Eye className="size-4" />
                        </Link>
                    </Button>
                </div>
            </div>
            <div className="mt-auto space-y-3">
                <div className="flex items-center justify-between text-sm border-t border-border/40 pt-3">
                    <span className="text-muted-foreground">Joined</span>
                    <span className="font-medium text-xs">{new Date(customer.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Notes</span>
                    <span className="font-mono font-bold bg-muted px-2 py-0.5 rounded-md border border-border/40 text-xs">
                        {customer.customer_notes_count}
                    </span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2">
                    <div className="flex flex-wrap gap-1">
                        {customer.segments.length > 0 ? customer.segments.map((s) => (
                            <Badge key={s.id} variant="outline" className="rounded-lg text-[10px] font-bold" style={{ borderColor: s.color, color: s.color }}>
                                {s.name}
                            </Badge>
                        )) : <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                    {customer.health_status && (() => {
                        const cfg = healthConfig[customer.health_status!];
                        return (
                            <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold shrink-0 ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                                <ShieldCheck className="size-3" />{cfg.label}
                            </span>
                        );
                    })()}
                </div>
            </div>
        </div>
    );

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
                    <Select value={filters.health || 'all'} onValueChange={(v) => handleFilter('health', v === 'all' ? undefined : v)}>
                        <SelectTrigger className="w-[160px] rounded-xl border-border/40">
                            <ShieldCheck className="size-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="All Health" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all" className="rounded-xl">All Health</SelectItem>
                            <SelectItem value="vip" className="rounded-xl">⭐ VIP</SelectItem>
                            <SelectItem value="healthy" className="rounded-xl">✅ Healthy</SelectItem>
                            <SelectItem value="at_risk" className="rounded-xl">⚠️ At Risk</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <DataTableWithPagination
                    columns={columns}
                    data={customers.data}
                    pagination={customers}
                    emptyMessage="No customers found."
                    onPageChange={(url) => router.get(url)}
                    renderGridItem={renderGridItem}
                />
            </div>
        </AppLayout>
    );
}
