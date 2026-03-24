import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    ShoppingCart, UserCircle2, CalendarDays, CreditCard, ArrowLeft,
    CheckCircle2, XCircle, RotateCcw, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Swal from 'sweetalert2';

interface OrderItem { id: number; product_name: string; quantity: number; unit_price: string; total_price: string; product: { id: number; name: string; sku: string | null } | null; }
interface Txn { id: number; transaction_number: string; type: string; amount: string; payment_method: string | null; notes: string | null; processed_by: { id: number; name: string } | null; created_at: string; }

interface Order {
    id: number; order_number: string; status: string;
    subtotal: string; tax_amount: string; discount_amount: string; total_amount: string;
    payment_method: string | null; notes: string | null;
    customer: { id: number; name: string; email: string } | null;
    created_by: { id: number; name: string } | null;
    items: OrderItem[]; transactions: Txn[]; created_at: string;
}

interface Props { order: Order; }

const fmt = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2 });

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Loader2 },
    processing: { label: 'Processing', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Loader2 },
    completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: XCircle },
    refunded: { label: 'Refunded', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: RotateCcw },
};

export default function OrderShow({ order }: Props) {
    const cfg = statusConfig[order.status] || statusConfig.pending;
    const StatusIcon = cfg.icon;

    const handleStatusChange = (newStatus: string) => {
        const label = newStatus === 'refunded' ? 'refund' : newStatus === 'cancelled' ? 'cancel' : `mark as ${newStatus}`;
        Swal.fire({
            title: `${label.charAt(0).toUpperCase() + label.slice(1)}?`,
            text: newStatus === 'refunded' ? 'A refund transaction will be created and stock will be restored.' : newStatus === 'cancelled' ? 'Stock will be restored.' : `Order will be marked as ${newStatus}.`,
            icon: ['refunded', 'cancelled'].includes(newStatus) ? 'warning' : 'question',
            showCancelButton: true, confirmButtonText: 'Yes, proceed',
        }).then((r) => {
            if (r.isConfirmed) router.put(`/admin/orders/${order.id}`, { status: newStatus }, {
                onSuccess: () => Swal.fire('Done!', `Order ${order.order_number} updated.`, 'success'),
            });
        });
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Orders', href: '/admin/orders' },
        { title: order.order_number, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={order.order_number} />
            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => router.get('/admin/orders')}>
                            <ArrowLeft className="size-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                {order.order_number}
                                <Badge variant="outline" className={`${cfg.color} rounded-lg text-xs font-bold flex items-center gap-1`}>
                                    <StatusIcon className="size-3" /> {cfg.label}
                                </Badge>
                            </h1>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <CalendarDays className="size-3.5" />{new Date(order.created_at).toLocaleString()}
                                {order.created_by && <span>· by {order.created_by.name}</span>}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {order.status === 'pending' && (
                            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold" onClick={() => handleStatusChange('processing')}>Mark Processing</Button>
                        )}
                        {order.status === 'processing' && (
                            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold" onClick={() => handleStatusChange('completed')}>Mark Completed</Button>
                        )}
                        {['pending', 'processing'].includes(order.status) && (
                            <Button size="sm" variant="outline" className="rounded-xl text-xs text-red-500 border-red-500/20" onClick={() => handleStatusChange('cancelled')}>Cancel</Button>
                        )}
                        {order.status === 'completed' && (
                            <Button size="sm" variant="outline" className="rounded-xl text-xs text-red-500 border-red-500/20" onClick={() => handleStatusChange('refunded')}>Refund</Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Customer Info */}
                    <Card className="border-border/40 bg-background/50 rounded-2xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2"><UserCircle2 className="size-4 text-bm-gold" />Customer</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.customer ? (
                                <div>
                                    <div className="font-semibold">{order.customer.name}</div>
                                    <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                                </div>
                            ) : <span className="text-sm text-muted-foreground">Walk-in Customer</span>}
                        </CardContent>
                    </Card>

                    {/* Payment */}
                    <Card className="border-border/40 bg-background/50 rounded-2xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2"><CreditCard className="size-4 text-bm-gold" />Payment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <div className="text-sm"><span className="text-muted-foreground">Method:</span> <span className="font-semibold capitalize">{order.payment_method || 'Unpaid'}</span></div>
                            <div className="text-sm"><span className="text-muted-foreground">Subtotal:</span> <span className="font-mono">{fmt(parseFloat(order.subtotal))}</span></div>
                            {parseFloat(order.discount_amount) > 0 && <div className="text-sm text-red-500"><span className="text-muted-foreground">Discount:</span> <span className="font-mono">-{fmt(parseFloat(order.discount_amount))}</span></div>}
                            <div className="text-lg font-bold pt-1 border-t border-border/40">Total: <span className="font-mono text-bm-gold">{fmt(parseFloat(order.total_amount))}</span></div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card className="border-border/40 bg-background/50 rounded-2xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2"><ShoppingCart className="size-4 text-bm-gold" />Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{order.notes || 'No notes.'}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Items */}
                <Card className="border-border/40 bg-background/50 rounded-2xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold">Order Items ({order.items.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-xl border border-border/40 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead><tr className="bg-muted/30 text-xs uppercase text-muted-foreground">
                                    <th className="text-left p-3">Product</th><th className="text-right p-3">Price</th><th className="text-right p-3">Qty</th><th className="text-right p-3">Total</th>
                                </tr></thead>
                                <tbody>
                                    {order.items.map((item) => (
                                        <tr key={item.id} className="border-t border-border/40">
                                            <td className="p-3"><div className="font-semibold">{item.product_name}</div>{item.product?.sku && <div className="text-xs text-muted-foreground">{item.product.sku}</div>}</td>
                                            <td className="p-3 text-right font-mono">{fmt(parseFloat(item.unit_price))}</td>
                                            <td className="p-3 text-right font-mono">{item.quantity}</td>
                                            <td className="p-3 text-right font-mono font-semibold">{fmt(parseFloat(item.total_price))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions */}
                {order.transactions.length > 0 && (
                    <Card className="border-border/40 bg-background/50 rounded-2xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold">Transactions ({order.transactions.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {order.transactions.map((txn) => (
                                <div key={txn.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
                                    <div>
                                        <div className="font-mono text-sm font-semibold">{txn.transaction_number}</div>
                                        <div className="text-xs text-muted-foreground">{txn.processed_by?.name} · {new Date(txn.created_at).toLocaleString()}</div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className={`text-xs rounded-md ${txn.type === 'refund' ? 'text-red-500 border-red-500/20' : 'text-emerald-600 border-emerald-500/20'}`}>
                                            {txn.type}
                                        </Badge>
                                        <div className={`font-mono font-bold ${txn.type === 'refund' ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {txn.type === 'refund' ? '-' : '+'}{fmt(parseFloat(txn.amount))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
