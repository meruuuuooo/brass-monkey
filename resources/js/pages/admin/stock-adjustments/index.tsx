import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
    Plus, ArrowUpCircle, ArrowDownCircle, ClipboardCheck, Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';
import { DataTableWithPagination } from '@/components/data-table';
import Swal from 'sweetalert2';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface ProductOption { id: number; name: string; sku: string | null; stock_quantity: number; }

interface StockAdjustment {
    id: number;
    type: string;
    quantity: number;
    reason: string | null;
    product: { id: number; name: string; sku: string | null } | null;
    adjusted_by: { id: number; name: string } | null;
    created_at: string;
}

interface PaginatedAdjustments {
    data: StockAdjustment[];
    current_page: number; last_page: number; per_page: number; total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    adjustments: PaginatedAdjustments;
    products: ProductOption[];
    filters: { type?: string };
}

const typeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    addition: { label: 'Addition', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: ArrowUpCircle },
    subtraction: { label: 'Subtraction', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: ArrowDownCircle },
    audit: { label: 'Audit', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: ClipboardCheck },
};

export default function StockAdjustmentsIndex({ adjustments, products, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: '',
        type: 'addition' as string,
        quantity: 1,
        reason: '',
    });

    const selectedProduct = products.find((p) => p.id.toString() === data.product_id);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Stock Adjustments', href: '#' },
    ];

    const columns: ColumnDef<StockAdjustment>[] = useMemo(() => [
        {
            accessorKey: 'created_at',
            header: 'Date',
            cell: ({ row }) => <span className="text-sm">{new Date(row.original.created_at).toLocaleString()}</span>,
        },
        {
            accessorKey: 'product',
            header: 'Product',
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold">{row.original.product?.name ?? '—'}</div>
                    {row.original.product?.sku && <div className="text-xs text-muted-foreground">SKU: {row.original.product.sku}</div>}
                </div>
            ),
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => {
                const cfg = typeConfig[row.original.type] || typeConfig.addition;
                const Icon = cfg.icon;
                return (
                    <Badge variant="outline" className={`${cfg.color} flex items-center gap-1 w-fit rounded-lg text-xs font-bold`}>
                        <Icon className="size-3" /> {cfg.label}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'quantity',
            header: 'Quantity',
            cell: ({ row }) => {
                const isAdd = row.original.type === 'addition';
                const isAudit = row.original.type === 'audit';
                return (
                    <span className={`font-mono font-bold ${isAdd ? 'text-emerald-600' : isAudit ? 'text-blue-500' : 'text-red-500'}`}>
                        {isAdd ? '+' : isAudit ? '=' : '-'}{row.original.quantity}
                    </span>
                );
            },
        },
        {
            accessorKey: 'reason',
            header: 'Reason',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.reason || '—'}</span>,
        },
        {
            accessorKey: 'adjusted_by',
            header: 'By',
            cell: ({ row }) => <span className="text-sm">{row.original.adjusted_by?.name ?? '—'}</span>,
        },
    ], []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/stock-adjustments', {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                Swal.fire('Done!', 'Stock adjustment recorded.', 'success');
            },
        });
    };

    const handleFilter = (key: string, value: string | undefined) => {
        router.get('/admin/stock-adjustments', { ...filters, [key]: value }, { preserveState: true, preserveScroll: true });
    };

    const renderGridItem = (adj: StockAdjustment) => {
        const cfg = typeConfig[adj.type] || typeConfig.addition;
        const Icon = cfg.icon;
        const isAdd = adj.type === 'addition';
        const isAudit = adj.type === 'audit';

        return (
            <div className="group relative bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden hover:shadow-md transition-all h-full flex flex-col p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="font-semibold text-lg truncate">{adj.product?.name ?? '—'}</div>
                        {adj.product?.sku && <div className="text-xs text-muted-foreground truncate mt-0.5">SKU: {adj.product.sku}</div>}
                        <div className="text-xs text-muted-foreground mt-1">{new Date(adj.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                        <Badge variant="outline" className={`${cfg.color} rounded-lg text-xs font-bold flex items-center gap-1`}>
                            <Icon className="size-3" /> {cfg.label}
                        </Badge>
                        <span className={`font-mono font-bold text-lg ${isAdd ? 'text-emerald-600' : isAudit ? 'text-blue-500' : 'text-red-500'}`}>
                            {isAdd ? '+' : isAudit ? '=' : '-'}{adj.quantity}
                        </span>
                    </div>
                </div>

                <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between text-sm border-t border-border/40 pt-3">
                        <span className="text-muted-foreground">Adjusted By</span>
                        <span className="font-medium text-xs">{adj.adjusted_by?.name ?? '—'}</span>
                    </div>
                    <div className="text-sm">
                        <span className="text-muted-foreground block mb-1">Reason</span>
                        <p className="text-sm border border-border/40 bg-muted/30 rounded-lg p-2 min-h-[40px] wrap-break-word">
                            {adj.reason || <span className="text-muted-foreground italic">No reason provided</span>}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock Adjustments" />
            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading title="Stock Adjustments" description="Record manual stock changes and audit counts." />
                    <Button className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold rounded-xl gap-2" onClick={() => { reset(); setIsModalOpen(true); }}>
                        <Plus className="size-4" /> New Adjustment
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <Select value={filters.type || 'all'} onValueChange={(v) => handleFilter('type', v === 'all' ? undefined : v)}>
                        <SelectTrigger className="w-[160px] rounded-xl border-border/40">
                            <Filter className="size-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all" className="rounded-xl">All Types</SelectItem>
                            {Object.entries(typeConfig).map(([k, v]) => (
                                <SelectItem key={k} value={k} className="rounded-xl">{v.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DataTableWithPagination
                    columns={columns}
                    data={adjustments.data}
                    pagination={adjustments}
                    emptyMessage="No stock adjustments recorded."
                    onPageChange={(url) => router.get(url)}
                    renderGridItem={renderGridItem}
                />
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl border-none bg-background/95 backdrop-blur-2xl p-0 overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)]">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col h-full max-h-[90vh]">
                            <DialogHeader className="p-8 pb-4 border-b border-border/40">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-bm-gold/10 text-bm-gold"><ClipboardCheck className="size-6" /></div>
                                    <div>
                                        <DialogTitle className="text-2xl font-black tracking-tight">Stock Adjustment</DialogTitle>
                                        <DialogDescription className="text-sm font-medium text-muted-foreground/70">Record a manual stock change.</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto p-8 space-y-5">
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Product *</Label>
                                    <Select value={data.product_id} onValueChange={(v) => setData('product_id', v)}>
                                        <SelectTrigger className="h-12 rounded-xl border-border/40 bg-background/50">
                                            <SelectValue placeholder="Select product" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl max-h-48">
                                            {products.map((p) => (
                                                <SelectItem key={p.id} value={p.id.toString()} className="rounded-xl text-sm">
                                                    {p.name} {p.sku ? `(${p.sku})` : ''} — Stock: {p.stock_quantity}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.product_id && <p className="text-xs text-red-500 ml-1">{errors.product_id}</p>}
                                </div>

                                {selectedProduct && (
                                    <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-sm">
                                        Current stock: <span className="font-mono font-bold">{selectedProduct.stock_quantity}</span>
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Adjustment Type *</Label>
                                    <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                                        <SelectTrigger className="h-12 rounded-xl border-border/40 bg-background/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            <SelectItem value="addition" className="rounded-xl">➕ Addition — Add stock</SelectItem>
                                            <SelectItem value="subtraction" className="rounded-xl">➖ Subtraction — Remove stock</SelectItem>
                                            <SelectItem value="audit" className="rounded-xl">📋 Audit — Set exact count</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
                                        {data.type === 'audit' ? 'New Stock Count *' : 'Quantity *'}
                                    </Label>
                                    <Input type="number" min="1" value={data.quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('quantity', parseInt(e.target.value) || 0)} className="h-12 rounded-xl border-border/40 bg-background/50 font-mono text-lg" />
                                    {errors.quantity && <p className="text-xs text-red-500 ml-1">{errors.quantity}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Reason</Label>
                                    <Input value={data.reason} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('reason', e.target.value)} className="h-12 rounded-xl border-border/40 bg-background/50" placeholder="e.g. Monthly physical count" />
                                </div>
                            </div>
                            <DialogFooter className="p-8 pt-4 border-t border-border/40 bg-background/80 backdrop-blur-md">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl">Cancel</Button>
                                <Button type="submit" className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold px-8 rounded-xl shadow-lg shadow-bm-gold/20" disabled={processing}>
                                    Record Adjustment
                                </Button>
                            </DialogFooter>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
