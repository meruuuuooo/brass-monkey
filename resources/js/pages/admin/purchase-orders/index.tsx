import { Head, router, useForm } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Plus, ClipboardList, CheckCircle2, Clock, Send, Package, XCircle, Trash2, Eye, Filter, ArrowUpDown, MoreVertical, Search, X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { DataTableWithPagination } from '@/components/data-table';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from '@/layouts/app-layout';

interface Supplier { id: number; name: string; }
interface ProductOption { id: number; name: string; sku: string | null; cost_price: string; }
interface POItem { product_id: string; quantity: number; unit_price: string; }

interface PurchaseOrder {
    id: number;
    order_number: string;
    status: string;
    total_amount: string;
    notes: string | null;
    supplier: Supplier | null;
    ordered_by: { id: number; name: string } | null;
    approved_by: { id: number; name: string } | null;
    items_count: number;
    ordered_at: string | null;
    received_at: string | null;
    created_at: string;
}

interface PaginatedPOs {
    data: PurchaseOrder[];
    current_page: number; last_page: number; per_page: number; total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    purchaseOrders: PaginatedPOs;
    suppliers: Supplier[];
    products: ProductOption[];
    filters: { status?: string; supplier?: string; search?: string };
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    draft: { label: 'Draft', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: ClipboardList },
    submitted: { label: 'Submitted', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Send },
    approved: { label: 'Approved', color: 'bg-bm-gold/10 text-bm-gold border-bm-gold/20', icon: CheckCircle2 },
    received: { label: 'Received', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: Package },
    cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
};

export default function PurchaseOrdersIndex({ purchaseOrders, suppliers, products, filters }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [items, setItems] = useState<POItem[]>([{ product_id: '', quantity: 1, unit_price: '' }]);
    const [searchInput, setSearchInput] = useState(filters.search || '');

    const { data, setData, post, processing, errors, reset } = useForm({
        supplier_id: '',
        notes: '',
    });

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Purchase Orders', href: '#' },
    ];

    const addItem = () => setItems([...items, { product_id: '', quantity: 1, unit_price: '' }]);
    const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
    const updateItem = (idx: number, field: keyof POItem, value: string | number) => {
        const updated = [...items];
        (updated[idx] as any)[field] = value;
        setItems(updated);
    };

    const handleProductSelect = (idx: number, productId: string) => {
        const product = products.find((p) => p.id.toString() === productId);
        const updated = [...items];
        updated[idx].product_id = productId;
        updated[idx].unit_price = product?.cost_price || '';
        setItems(updated);
    };

    const totalAmount = items.reduce((sum, i) => sum + (parseFloat(i.unit_price) || 0) * i.quantity, 0);

    const columns: ColumnDef<PurchaseOrder>[] = useMemo(() => [
        {
            accessorKey: 'order_number',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    PO # <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-mono font-semibold">{row.original.order_number}</span>,
        },
        {
            accessorKey: 'supplier',
            header: 'Supplier',
            cell: ({ row }) => <span>{row.original.supplier?.name ?? '—'}</span>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const cfg = statusConfig[row.original.status] || statusConfig.draft;
                const Icon = cfg.icon;

                return (
                    <Badge variant="outline" className={`${cfg.color} flex items-center gap-1 w-fit rounded-lg text-xs font-bold`}>
                        <Icon className="size-3" /> {cfg.label}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'items_count',
            header: 'Items',
            cell: ({ row }) => <span className="font-mono">{row.original.items_count}</span>,
        },
        {
            accessorKey: 'total_amount',
            header: 'Total',
            cell: ({ row }) => <span className="font-mono font-semibold">${parseFloat(row.original.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>,
        },
        {
            accessorKey: 'created_at',
            header: 'Date',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{new Date(row.original.created_at).toLocaleDateString()}</span>,
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const po = row.original;
                const nextStatus: Record<string, string> = { draft: 'submitted', submitted: 'approved', approved: 'received' };
                const next = nextStatus[po.status];

                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl">
                                {next && (
                                    <>
                                        <DropdownMenuItem onClick={() => handleStatusChange(po, next)} className="rounded-lg cursor-pointer text-bm-gold font-semibold">
                                            {next === 'submitted' ? 'Submit' : next === 'approved' ? 'Approve' : 'Mark Received'}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                {po.status !== 'received' && po.status !== 'cancelled' && (
                                    <>
                                        <DropdownMenuItem onClick={() => handleStatusChange(po, 'cancelled')} className="rounded-lg cursor-pointer text-red-500">
                                            Cancel
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                {po.status === 'cancelled' && (
                                    <>
                                        <DropdownMenuItem onClick={() => handleStatusChange(po, 'draft')} className="rounded-lg cursor-pointer text-bm-gold font-semibold">
                                            Reopen
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                {po.status === 'received' && (
                                    <>
                                        <DropdownMenuItem onClick={() => handleStatusChange(po, 'approved')} className="rounded-lg cursor-pointer text-bm-gold font-semibold">
                                            Reopen
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                {(po.status === 'draft' || po.status === 'cancelled' || po.status === 'received') && (
                                    <DropdownMenuItem onClick={() => handleDelete(po)} className="rounded-lg cursor-pointer text-red-500">
                                        <Trash2 className="size-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ], []);

    const handleStatusChange = (po: PurchaseOrder, status: string) => {
        const actionLabel = status === 'cancelled' ? 'cancel' : `mark as ${status}`;
        Swal.fire({
            title: `${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)}?`,
            text: `PO ${po.order_number} will be ${status}.${status === 'received' ? ' Stock will be automatically added.' : ''}`,
            icon: status === 'cancelled' ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, proceed',
        }).then((r) => {
            if (r.isConfirmed) {
                router.put(`/admin/purchase-orders/${po.id}`, { status }, {
                    onSuccess: () => Swal.fire('Done!', `PO ${po.order_number} is now ${status}.`, 'success'),
                });
            }
        });
    };

    const handleDelete = (po: PurchaseOrder) => {
        Swal.fire({
            title: 'Delete draft PO?', text: po.order_number, icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Delete',
        }).then((r) => {
            if (r.isConfirmed) {
router.delete(`/admin/purchase-orders/${po.id}`, {
                onSuccess: () => Swal.fire('Deleted!', 'Purchase order removed.', 'success'),
            });
}
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            supplier_id: data.supplier_id,
            notes: data.notes,
            items: items.filter((i) => i.product_id).map((i) => ({
                product_id: parseInt(i.product_id),
                quantity: i.quantity,
                unit_price: parseFloat(i.unit_price) || 0,
            })),
        };
        router.post('/admin/purchase-orders', payload, {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
                setItems([{ product_id: '', quantity: 1, unit_price: '' }]);
                Swal.fire('Created!', 'Purchase order created as draft.', 'success');
            },
        });
    };

    const handleFilter = (key: string, value: string | undefined) => {
        router.get('/admin/purchase-orders', { ...filters, [key]: value }, { preserveState: true, preserveScroll: true });
    };

    const handleSearch = (value: string) => {
        setSearchInput(value);
        router.get('/admin/purchase-orders', { ...filters, search: value || undefined }, { preserveState: true, preserveScroll: true });
    };

    const renderGridItem = (po: PurchaseOrder) => {
        const cfg = statusConfig[po.status] || statusConfig.draft;
        const Icon = cfg.icon;
        const nextStatus: Record<string, string> = { draft: 'submitted', submitted: 'approved', approved: 'received' };
        const next = nextStatus[po.status];

        return (
            <div className="group relative bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden hover:shadow-md transition-all h-full flex flex-col p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0 pr-2">
                        <div className="font-mono font-bold text-lg truncate">{po.order_number}</div>
                        <div className="font-medium mt-1 truncate">{po.supplier?.name ?? '—'}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">{new Date(po.created_at).toLocaleDateString()}</div>
                    </div>
                    <Badge variant="outline" className={`${cfg.color} rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0`}>
                        <Icon className="size-3" /> {cfg.label}
                    </Badge>
                </div>

                <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between text-sm border-t border-border/40 pt-3">
                        <span className="text-muted-foreground">Items</span>
                        <span className="font-mono font-medium">{po.items_count}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-mono font-bold text-bm-gold text-base">
                            ${parseFloat(po.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-3">
                    <div />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                            {next && (
                                <>
                                    <DropdownMenuItem onClick={() => handleStatusChange(po, next)} className="rounded-lg cursor-pointer text-bm-gold font-semibold">
                                        {next === 'submitted' ? 'Submit' : next === 'approved' ? 'Approve' : 'Mark Received'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            {po.status !== 'received' && po.status !== 'cancelled' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(po, 'cancelled')} className="rounded-lg cursor-pointer text-red-500">
                                    Cancel
                                </DropdownMenuItem>
                            )}
                            {po.status === 'cancelled' && (
                                <>
                                    <DropdownMenuItem onClick={() => handleStatusChange(po, 'draft')} className="rounded-lg cursor-pointer text-bm-gold font-semibold">
                                        Reopen
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            {po.status === 'received' && (
                                <>
                                    <DropdownMenuItem onClick={() => handleStatusChange(po, 'approved')} className="rounded-lg cursor-pointer text-bm-gold font-semibold">
                                        Reopen
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            {(po.status === 'draft' || po.status === 'cancelled' || po.status === 'received') && (
                                <DropdownMenuItem onClick={() => handleDelete(po)} className="rounded-lg cursor-pointer text-red-500">
                                    <Trash2 className="size-4 mr-2" /> Delete
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Purchase Orders" />
            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading title="Purchase Orders" description="Create and manage purchase orders to restock inventory." />
                    <Button className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold rounded-xl gap-2" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="size-4" /> New Purchase Order
                    </Button>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1 sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by PO # or supplier..."
                            value={searchInput}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9 rounded-xl border-border/40"
                        />
                        {searchInput && (
                            <button
                                onClick={() => handleSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                    </div>
                    <Select value={filters.status || 'all'} onValueChange={(v) => handleFilter('status', v === 'all' ? undefined : v)}>
                        <SelectTrigger className="w-[160px] rounded-xl border-border/40">
                            <Filter className="size-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all" className="rounded-xl">All Status</SelectItem>
                            {Object.entries(statusConfig).map(([k, v]) => (
                                <SelectItem key={k} value={k} className="rounded-xl">{v.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filters.supplier || 'all'} onValueChange={(v) => handleFilter('supplier', v === 'all' ? undefined : v)}>
                        <SelectTrigger className="w-[180px] rounded-xl border-border/40">
                            <SelectValue placeholder="All Suppliers" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all" className="rounded-xl">All Suppliers</SelectItem>
                            {suppliers.map((s) => (
                                <SelectItem key={s.id} value={s.id.toString()} className="rounded-xl">{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DataTableWithPagination
                    columns={columns}
                    data={purchaseOrders.data}
                    pagination={purchaseOrders}
                    emptyMessage="No purchase orders yet."
                    onPageChange={(url) => router.get(url)}
                    renderGridItem={renderGridItem}
                />
            </div>

            {/* Create PO Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-3xl rounded-3xl border-none bg-background/95 backdrop-blur-2xl p-0 overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)]">
                    <form onSubmit={handleCreateSubmit}>
                        <div className="flex flex-col h-full max-h-[90vh]">
                            <DialogHeader className="p-8 pb-4 border-b border-border/40">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-bm-gold/10 text-bm-gold"><ClipboardList className="size-6" /></div>
                                    <div>
                                        <DialogTitle className="text-2xl font-black tracking-tight">New Purchase Order</DialogTitle>
                                        <DialogDescription className="text-sm font-medium text-muted-foreground/70">Select a supplier and add line items.</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Supplier *</Label>
                                    <Select value={data.supplier_id} onValueChange={(v) => setData('supplier_id', v)}>
                                        <SelectTrigger className="h-12 rounded-xl border-border/40 bg-background/50">
                                            <SelectValue placeholder="Select supplier" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            {suppliers.map((s) => (
                                                <SelectItem key={s.id} value={s.id.toString()} className="rounded-xl">{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Line Items *</Label>
                                        <Button type="button" variant="outline" size="sm" className="rounded-xl text-xs" onClick={addItem}>
                                            <Plus className="size-3 mr-1" /> Add Item
                                        </Button>
                                    </div>
                                    {items.map((item, idx) => (
                                        <div key={idx} className="grid grid-cols-[1fr_80px_100px_36px] gap-2 items-end">
                                            <div>
                                                {idx === 0 && <Label className="text-[10px] uppercase text-muted-foreground/60 ml-1">Product</Label>}
                                                <Select value={item.product_id} onValueChange={(v) => handleProductSelect(idx, v)}>
                                                    <SelectTrigger className="h-10 rounded-lg border-border/40 bg-background/50 text-sm">
                                                        <SelectValue placeholder="Select product" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl max-h-48">
                                                        {products.map((p) => (
                                                            <SelectItem key={p.id} value={p.id.toString()} className="rounded-xl text-sm">
                                                                {p.name} {p.sku ? `(${p.sku})` : ''}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                {idx === 0 && <Label className="text-[10px] uppercase text-muted-foreground/60 ml-1">Qty</Label>}
                                                <Input type="number" min="1" value={item.quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} className="h-10 rounded-lg border-border/40 bg-background/50 font-mono" />
                                            </div>
                                            <div>
                                                {idx === 0 && <Label className="text-[10px] uppercase text-muted-foreground/60 ml-1">Unit Price</Label>}
                                                <Input type="number" step="0.01" min="0" value={item.unit_price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(idx, 'unit_price', e.target.value)} className="h-10 rounded-lg border-border/40 bg-background/50 font-mono" />
                                            </div>
                                            <div>
                                                {idx === 0 && <Label className="text-[10px] invisible">X</Label>}
                                                {items.length > 1 && (
                                                    <Button type="button" variant="ghost" size="icon" className="size-10 text-red-400 hover:text-red-600" onClick={() => removeItem(idx)}>
                                                        <XCircle className="size-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="text-right text-sm font-bold pt-2 border-t border-border/40">
                                        Total: <span className="font-mono text-bm-gold">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Notes</Label>
                                    <Textarea value={data.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('notes', e.target.value)} className="min-h-[60px] rounded-xl border-border/40 bg-background/50" placeholder="Optional notes..." />
                                </div>
                            </div>
                            <DialogFooter className="p-8 pt-4 border-t border-border/40 bg-background/80 backdrop-blur-md">
                                <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-xl">Cancel</Button>
                                <Button type="submit" className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold px-8 rounded-xl shadow-lg shadow-bm-gold/20" disabled={processing}>
                                    Create as Draft
                                </Button>
                            </DialogFooter>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
