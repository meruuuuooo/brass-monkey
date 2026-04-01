import { Head, router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Search, Filter, ArrowUpCircle, ArrowDownCircle, RotateCcw, Link as LinkIcon,
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

interface Txn {
    id: number; transaction_number: string; type: string; amount: string;
    payment_method: string | null; reference: string | null; notes: string | null;
    order: { id: number; order_number: string } | null;
    processed_by: { id: number; name: string } | null;
    created_at: string;
}

interface PaginatedTxns {
    data: Txn[];
    current_page: number; last_page: number; per_page: number; total: number;
    prev_page_url: string | null; next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    transactions: PaginatedTxns;
    filters: { type?: string; search?: string };
}

const typeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    payment: { label: 'Payment', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: ArrowUpCircle },
    refund: { label: 'Refund', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: RotateCcw },
    adjustment: { label: 'Adjustment', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: ArrowDownCircle },
};

const fmt = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2 });

export default function TransactionsIndex({ transactions, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const columns: ColumnDef<Txn>[] = useMemo(() => [
        {
            accessorKey: 'transaction_number', header: 'TXN #',
            cell: ({ row }) => <span className="font-mono font-semibold">{row.original.transaction_number}</span>,
        },
        {
            accessorKey: 'type', header: 'Type',
            cell: ({ row }) => {
                const cfg = typeConfig[row.original.type] || typeConfig.payment;
                const Icon = cfg.icon;

                return <Badge variant="outline" className={`${cfg.color} rounded-lg text-xs font-bold flex items-center gap-1 w-fit`}><Icon className="size-3" />{cfg.label}</Badge>;
            },
        },
        {
            accessorKey: 'amount', header: 'Amount',
            cell: ({ row }) => (
                <span className={`font-mono font-bold ${row.original.type === 'refund' ? 'text-red-500' : 'text-emerald-600'}`}>
                    {row.original.type === 'refund' ? '-' : '+'}{fmt(parseFloat(row.original.amount))}
                </span>
            ),
        },
        {
            accessorKey: 'payment_method', header: 'Method',
            cell: ({ row }) => <span className="capitalize text-sm">{row.original.payment_method || '—'}</span>,
        },
        {
            accessorKey: 'order', header: 'Order',
            cell: ({ row }) => row.original.order ? (
                <Link href={`/admin/orders/${row.original.order.id}`} className="font-mono text-sm text-bm-gold hover:underline flex items-center gap-1">
                    <LinkIcon className="size-3" />{row.original.order.order_number}
                </Link>
            ) : <span className="text-muted-foreground">—</span>,
        },
        {
            accessorKey: 'processed_by', header: 'By',
            cell: ({ row }) => <span className="text-sm">{row.original.processed_by?.name ?? '—'}</span>,
        },
        {
            accessorKey: 'created_at', header: 'Date',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{new Date(row.original.created_at).toLocaleString()}</span>,
        },
    ], []);

    const handleSearch = () => {
        router.get('/admin/transactions', { ...filters, search: search || undefined }, { preserveState: true });
    };

    const handleFilter = (k: string, v: string | undefined) => {
        router.get('/admin/transactions', { ...filters, [k]: v }, { preserveState: true });
    };

    const renderGridItem = (txn: Txn) => {
        const cfg = typeConfig[txn.type] || typeConfig.payment;
        const Icon = cfg.icon;
        const isRefund = txn.type === 'refund';

        return (
            <div className="group relative bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden hover:shadow-md transition-all h-full flex flex-col p-5">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="font-mono font-bold text-base">{txn.transaction_number}</div>
                        <p className="text-sm font-medium mt-1 capitalize">{txn.payment_method || '—'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(txn.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`font-mono font-bold text-lg ${isRefund ? 'text-red-500' : 'text-emerald-600'}`}>
                            {isRefund ? '-' : '+'}{fmt(parseFloat(txn.amount))}
                        </span>
                        <Badge variant="outline" className={`${cfg.color} rounded-lg text-xs font-bold flex items-center gap-1`}>
                            <Icon className="size-3" /> {cfg.label}
                        </Badge>
                    </div>
                </div>

                <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between text-sm border-t border-border/40 pt-3">
                        <span className="text-muted-foreground">Processed By</span>
                        <span className="font-medium text-xs">{txn.processed_by?.name ?? '—'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Order</span>
                        {txn.order ? (
                            <Link href={`/admin/orders/${txn.order.id}`} className="font-mono text-sm text-bm-gold hover:underline flex items-center gap-1 z-10 relative">
                                <LinkIcon className="size-3" />{txn.order.order_number}
                            </Link>
                        ) : <span className="text-muted-foreground">—</span>}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Transactions', href: '#' }]}>
            <Head title="Transactions" />
            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                <Heading title="Transactions" description="View all payment and refund records." />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input placeholder="Search transactions..." className="pl-9 rounded-xl border-border/40" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                    </div>
                    <Select value={filters.type || 'all'} onValueChange={(v) => handleFilter('type', v === 'all' ? undefined : v)}>
                        <SelectTrigger className="w-[160px] rounded-xl border-border/40">
                            <Filter className="size-4 mr-2 text-muted-foreground" /><SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all" className="rounded-xl">All Types</SelectItem>
                            {Object.entries(typeConfig).map(([k, v]) => <SelectItem key={k} value={k} className="rounded-xl">{v.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <DataTableWithPagination
                    columns={columns}
                    data={transactions.data}
                    pagination={transactions}
                    emptyMessage="No transactions yet."
                    onPageChange={(url) => router.get(url)}
                    renderGridItem={renderGridItem}
                />
            </div>
        </AppLayout>
    );
}
