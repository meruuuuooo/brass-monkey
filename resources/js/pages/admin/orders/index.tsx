import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
    Plus, Search, ShoppingCart, Eye, Filter, XCircle, ArrowUpDown,
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Customer { id: number; name: string; email: string; }
interface ProductOption { id: number; name: string; sku: string | null; price: string; stock_quantity: number; }
interface LineItem { product_id: string; quantity: number; unit_price: string; }

interface Order {
    id: number; order_number: string; status: string;
    subtotal: string; discount_amount: string; total_amount: string;
    payment_method: string | null;
    customer: { id: number; name: string; email: string } | null;
    created_by: { id: number; name: string } | null;
    items_count: number; created_at: string;
}

interface PaginatedOrders {
    data: Order[];
    current_page: number; last_page: number; per_page: number; total: number;
    prev_page_url: string | null; next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    orders: PaginatedOrders; customers: Customer[]; products: ProductOption[];
    filters: { status?: string; search?: string };
}

const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    processing: { label: 'Processing', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    cancelled: { label: 'Cancelled', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
    refunded: { label: 'Refunded', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

const fmt = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2 });

export default function OrdersIndex({ orders, customers, products, filters }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [items, setItems] = useState<LineItem[]>([{ product_id: '', quantity: 1, unit_price: '' }]);
    const [search, setSearch] = useState(filters.search || '');

    const { data, setData, reset } = useForm({
        customer_id: '', payment_method: '', discount_amount: '0', notes: '',
    });

    const addItem = () => setItems([...items, { product_id: '', quantity: 1, unit_price: '' }]);
    const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
    const updateItem = (i: number, f: keyof LineItem, v: string | number) => {
        const u = [...items]; (u[i] as any)[f] = v; setItems(u);
    };
    const handleProductSelect = (i: number, pid: string) => {
        const p = products.find((x) => x.id.toString() === pid);
        const u = [...items]; u[i].product_id = pid; u[i].unit_price = p?.price || ''; setItems(u);
    };

    const subtotal = items.reduce((s, i) => s + (parseFloat(i.unit_price) || 0) * i.quantity, 0);
    const discount = parseFloat(data.discount_amount) || 0;
    const total = Math.max(0, subtotal - discount);

    const columns: ColumnDef<Order>[] = useMemo(() => [
        {
            accessorKey: 'order_number', header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>Order # <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
            ),
            cell: ({ row }) => <Link href={`/admin/orders/${row.original.id}`} className="font-mono font-semibold text-bm-gold hover:underline">{row.original.order_number}</Link>,
        },
        {
            accessorKey: 'customer', header: 'Customer',
            cell: ({ row }) => <span>{row.original.customer?.name ?? 'Walk-in'}</span>,
        },
        {
            accessorKey: 'status', header: 'Status',
            cell: ({ row }) => {
                const cfg = statusConfig[row.original.status] || statusConfig.pending;
                return <Badge variant="outline" className={`${cfg.color} rounded-lg text-xs font-bold`}>{cfg.label}</Badge>;
            },
        },
        {
            accessorKey: 'items_count', header: 'Items',
            cell: ({ row }) => <span className="font-mono">{row.original.items_count}</span>,
        },
        {
            accessorKey: 'total_amount', header: 'Total',
            cell: ({ row }) => <span className="font-mono font-semibold">{fmt(parseFloat(row.original.total_amount))}</span>,
        },
        {
            accessorKey: 'created_at', header: 'Date',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{new Date(row.original.created_at).toLocaleDateString()}</span>,
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button variant="ghost" size="sm" className="text-xs font-bold text-bm-gold gap-1" asChild>
                        <Link href={`/admin/orders/${row.original.id}`}><Eye className="size-3" /> View</Link>
                    </Button>
                </div>
            ),
        },
    ], []);

    const handleSearch = () => {
        router.get('/admin/orders', { ...filters, search: search || undefined }, { preserveState: true });
    };

    const handleFilter = (k: string, v: string | undefined) => {
        router.get('/admin/orders', { ...filters, [k]: v }, { preserveState: true });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            customer_id: data.customer_id || null,
            payment_method: data.payment_method || null,
            discount_amount: parseFloat(data.discount_amount) || 0,
            notes: data.notes || null,
            items: items.filter((i) => i.product_id).map((i) => ({
                product_id: parseInt(i.product_id), quantity: i.quantity, unit_price: parseFloat(i.unit_price) || 0,
            })),
        };
        router.post('/admin/orders', payload, {
            onSuccess: () => {
                setIsCreateOpen(false); reset();
                setItems([{ product_id: '', quantity: 1, unit_price: '' }]);
                Swal.fire('Created!', 'Order created successfully.', 'success');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Orders', href: '#' }]}>
            <Head title="Orders" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading title="Orders" description="View all orders and create new sales." />
                    <Button className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold rounded-xl gap-2" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="size-4" /> New Order
                    </Button>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input placeholder="Search orders..." className="pl-9 rounded-xl border-border/40" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                    </div>
                    <Select value={filters.status || 'all'} onValueChange={(v) => handleFilter('status', v === 'all' ? undefined : v)}>
                        <SelectTrigger className="w-[160px] rounded-xl border-border/40">
                            <Filter className="size-4 mr-2 text-muted-foreground" /><SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all" className="rounded-xl">All Status</SelectItem>
                            {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k} className="rounded-xl">{v.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <DataTableWithPagination columns={columns} data={orders.data} pagination={orders} emptyMessage="No orders yet." onPageChange={(url) => router.get(url)} />
            </div>

            {/* Create Order Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-3xl rounded-3xl border-none bg-background/95 backdrop-blur-2xl p-0 overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)]">
                    <form onSubmit={handleCreate}>
                        <div className="flex flex-col h-full max-h-[90vh]">
                            <DialogHeader className="p-8 pb-4 border-b border-border/40">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-bm-gold/10 text-bm-gold"><ShoppingCart className="size-6" /></div>
                                    <div>
                                        <DialogTitle className="text-2xl font-black tracking-tight">New Order</DialogTitle>
                                        <DialogDescription className="text-sm font-medium text-muted-foreground/70">Create a new sales order.</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Customer</Label>
                                        <Select value={data.customer_id || 'walk-in'} onValueChange={(v) => setData('customer_id', v === 'walk-in' ? '' : v)}>
                                            <SelectTrigger className="h-12 rounded-xl border-border/40 bg-background/50"><SelectValue placeholder="Walk-in" /></SelectTrigger>
                                            <SelectContent className="rounded-2xl max-h-48">
                                                <SelectItem value="walk-in" className="rounded-xl">Walk-in Customer</SelectItem>
                                                {customers.map((c) => <SelectItem key={c.id} value={c.id.toString()} className="rounded-xl">{c.name} ({c.email})</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Payment Method</Label>
                                        <Select value={data.payment_method || 'none'} onValueChange={(v) => setData('payment_method', v === 'none' ? '' : v)}>
                                            <SelectTrigger className="h-12 rounded-xl border-border/40 bg-background/50"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                <SelectItem value="none" className="rounded-xl">Unpaid (Pending)</SelectItem>
                                                <SelectItem value="cash" className="rounded-xl">Cash</SelectItem>
                                                <SelectItem value="card" className="rounded-xl">Card</SelectItem>
                                                <SelectItem value="gcash" className="rounded-xl">GCash</SelectItem>
                                                <SelectItem value="bank_transfer" className="rounded-xl">Bank Transfer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Items *</Label>
                                        <Button type="button" variant="outline" size="sm" className="rounded-xl text-xs" onClick={addItem}><Plus className="size-3 mr-1" /> Add</Button>
                                    </div>
                                    {items.map((item, idx) => (
                                        <div key={idx} className="grid grid-cols-[1fr_80px_100px_36px] gap-2 items-end">
                                            <div>
                                                {idx === 0 && <Label className="text-[10px] uppercase text-muted-foreground/60 ml-1">Product</Label>}
                                                <Select value={item.product_id} onValueChange={(v) => handleProductSelect(idx, v)}>
                                                    <SelectTrigger className="h-10 rounded-lg border-border/40 bg-background/50 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                                                    <SelectContent className="rounded-2xl max-h-48">
                                                        {products.map((p) => <SelectItem key={p.id} value={p.id.toString()} className="rounded-xl text-sm">{p.name} {p.sku ? `(${p.sku})` : ''} — {p.stock_quantity} in stock</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                {idx === 0 && <Label className="text-[10px] uppercase text-muted-foreground/60 ml-1">Qty</Label>}
                                                <Input type="number" min="1" value={item.quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} className="h-10 rounded-lg font-mono" />
                                            </div>
                                            <div>
                                                {idx === 0 && <Label className="text-[10px] uppercase text-muted-foreground/60 ml-1">Price</Label>}
                                                <Input type="number" step="0.01" min="0" value={item.unit_price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(idx, 'unit_price', e.target.value)} className="h-10 rounded-lg font-mono" />
                                            </div>
                                            <div>
                                                {idx === 0 && <Label className="text-[10px] invisible">X</Label>}
                                                {items.length > 1 && <Button type="button" variant="ghost" size="icon" className="size-10 text-red-400" onClick={() => removeItem(idx)}><XCircle className="size-4" /></Button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Discount</Label>
                                        <Input type="number" step="0.01" min="0" value={data.discount_amount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('discount_amount', e.target.value)} className="h-12 rounded-xl font-mono" />
                                    </div>
                                    <div className="flex flex-col justify-end gap-1 text-right p-3 rounded-xl bg-muted/30 border border-border/40">
                                        <div className="text-xs text-muted-foreground">Subtotal: <span className="font-mono">{fmt(subtotal)}</span></div>
                                        {discount > 0 && <div className="text-xs text-red-500">Discount: <span className="font-mono">-{fmt(discount)}</span></div>}
                                        <div className="text-lg font-bold">Total: <span className="font-mono text-bm-gold">{fmt(total)}</span></div>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Notes</Label>
                                    <Textarea value={data.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('notes', e.target.value)} className="min-h-[60px] rounded-xl border-border/40 bg-background/50" placeholder="Optional..." />
                                </div>
                            </div>
                            <DialogFooter className="p-8 pt-4 border-t border-border/40 bg-background/80 backdrop-blur-md">
                                <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-xl">Cancel</Button>
                                <Button type="submit" className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold px-8 rounded-xl shadow-lg shadow-bm-gold/20">
                                    {data.payment_method ? 'Create & Mark Paid' : 'Create Order'}
                                </Button>
                            </DialogFooter>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
