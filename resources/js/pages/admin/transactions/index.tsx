import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
    Search, Filter, ArrowUpCircle, ArrowDownCircle, RotateCcw, Link as LinkIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';
import { DataTableWithPagination } from '@/components/data-table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Link } from '@inertiajs/react';

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
                <DataTableWithPagination columns={columns} data={transactions.data} pagination={transactions} emptyMessage="No transactions yet." onPageChange={(url) => router.get(url)} />
            </div>
        </AppLayout>
    );
}
