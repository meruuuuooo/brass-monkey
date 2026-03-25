import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    Package, AlertTriangle, DollarSign, ArrowLeft, ArrowUpCircle, ArrowDownCircle, ClipboardCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableWithPagination } from '@/components/data-table';
import { Input } from '@/components/ui/input';

interface ProductRow {
    id: number; name: string; sku: string | null; stock_quantity: number; low_stock_threshold: number;
    cost_price: string; price: string; is_available: boolean; stock_value: number; retail_value: number; is_low_stock: boolean;
}

interface Adjustment {
    id: number; type: string; quantity: number;
    product: { id: number; name: string; sku: string | null } | null;
    adjusted_by: { id: number; name: string } | null;
    created_at: string;
}

interface Props {
    products: ProductRow[];
    summary: { totalProducts: number; totalCostValue: number; totalRetailValue: number; lowStockCount: number; outOfStockCount: number; potentialProfit: number; };
    recentAdjustments: Adjustment[];
}

const fmt = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2 });

export default function InventoryReport({ products, summary, recentAdjustments }: Props) {
    const [search, setSearch] = useState('');
    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' }, { title: 'Reports', href: '/admin/reports' }, { title: 'Inventory', href: '#' },
    ];

    const filtered = useMemo(() => {
        if (!search) return products;
        const q = search.toLowerCase();
        return products.filter((p) => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q));
    }, [products, search]);

    const kpis = [
        { label: 'Total Products', value: summary.totalProducts, icon: Package, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { label: 'Cost Value', value: fmt(summary.totalCostValue), icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Retail Value', value: fmt(summary.totalRetailValue), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Potential Profit', value: fmt(summary.potentialProfit), icon: DollarSign, color: 'text-bm-gold', bg: 'bg-bm-gold/10' },
        { label: 'Low Stock', value: summary.lowStockCount, icon: AlertTriangle, color: summary.lowStockCount > 0 ? 'text-amber-500' : 'text-emerald-500', bg: summary.lowStockCount > 0 ? 'bg-amber-500/10' : 'bg-emerald-500/10' },
        { label: 'Out of Stock', value: summary.outOfStockCount, icon: AlertTriangle, color: summary.outOfStockCount > 0 ? 'text-red-500' : 'text-emerald-500', bg: summary.outOfStockCount > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10' },
    ];

    const columns: ColumnDef<ProductRow>[] = useMemo(() => [
        { accessorKey: 'name', header: 'Product', cell: ({ row }) => (<div><div className="font-semibold">{row.original.name}</div><div className="text-xs text-muted-foreground">{row.original.sku || '—'}</div></div>) },
        {
            accessorKey: 'stock_quantity', header: 'Stock', cell: ({ row }) => {
                const low = row.original.is_low_stock;
                return <span className={`font-mono font-bold ${low ? 'text-red-500' : ''}`}>{row.original.stock_quantity}{low && <AlertTriangle className="inline size-3 ml-1" />}</span>;
            }
        },
        { accessorKey: 'cost_price', header: 'Cost', cell: ({ row }) => <span className="font-mono text-sm">{fmt(parseFloat(row.original.cost_price))}</span> },
        { accessorKey: 'price', header: 'Price', cell: ({ row }) => <span className="font-mono text-sm">{fmt(parseFloat(row.original.price))}</span> },
        { accessorKey: 'stock_value', header: 'Stock Value', cell: ({ row }) => <span className="font-mono text-sm font-semibold">{fmt(row.original.stock_value)}</span> },
    ], []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Report" />
            <div className="flex flex-col gap-6 p-4 md:p-6">

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {kpis.map((k) => (
                        <Card key={k.label} className="border-border/40 bg-background/50 rounded-2xl">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{k.label}</p>
                                        <h3 className="text-lg font-black tracking-tight mt-0.5">{k.value}</h3></div>
                                    <div className={`size-9 rounded-lg ${k.bg} ${k.color} flex items-center justify-center`}><k.icon className="size-4" /></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        <Input placeholder="Search products..." className="rounded-xl border-border/40" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <div className="rounded-2xl border border-border/40 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead><tr className="bg-muted/30 text-xs uppercase text-muted-foreground">
                                    <th className="text-left p-3">Product</th><th className="text-right p-3">Stock</th><th className="text-right p-3">Cost</th><th className="text-right p-3">Price</th><th className="text-right p-3">Value</th>
                                </tr></thead>
                                <tbody>
                                    {filtered.map((p) => (
                                        <tr key={p.id} className={`border-t border-border/40 ${p.is_low_stock ? 'bg-red-500/5' : ''}`}>
                                            <td className="p-3"><div className="font-semibold">{p.name}</div><div className="text-xs text-muted-foreground">{p.sku || '—'}</div></td>
                                            <td className={`p-3 text-right font-mono font-bold ${p.is_low_stock ? 'text-red-500' : ''}`}>{p.stock_quantity}</td>
                                            <td className="p-3 text-right font-mono">{fmt(parseFloat(p.cost_price))}</td>
                                            <td className="p-3 text-right font-mono">{fmt(parseFloat(p.price))}</td>
                                            <td className="p-3 text-right font-mono font-semibold">{fmt(p.stock_value)}</td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No products.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Adjustments */}
                    <Card className="border-border/40 bg-background/50 rounded-2xl h-fit">
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Recent Adjustments</CardTitle></CardHeader>
                        <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                            {recentAdjustments.map((adj) => (
                                <div key={adj.id} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/40">
                                    <div className="flex items-center gap-2">
                                        {adj.type === 'addition' ? <ArrowUpCircle className="size-4 text-emerald-500" /> : adj.type === 'subtraction' ? <ArrowDownCircle className="size-4 text-red-500" /> : <ClipboardCheck className="size-4 text-blue-500" />}
                                        <div><div className="text-xs font-semibold">{adj.product?.name}</div><div className="text-[10px] text-muted-foreground">{new Date(adj.created_at).toLocaleDateString()}</div></div>
                                    </div>
                                    <span className={`font-mono font-bold text-sm ${adj.type === 'addition' ? 'text-emerald-600' : adj.type === 'audit' ? 'text-blue-500' : 'text-red-500'}`}>
                                        {adj.type === 'addition' ? '+' : adj.type === 'audit' ? '=' : '-'}{adj.quantity}
                                    </span>
                                </div>
                            ))}
                            {recentAdjustments.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No adjustments.</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
