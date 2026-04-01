import { Head, Link } from '@inertiajs/react';
import { ShoppingBag, Package, Calendar, DollarSign, Download, ArrowRight, CreditCard } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';

interface OrderItem {
    id: number; quantity: number; unit_price: number; total_price: number; product_name: string;
    product: { id: number; name: string; image_path: string | null } | null;
}

interface Order {
    id: number; order_number: string; status: string; total_amount: number; created_at: string;
    items: OrderItem[]; payment_method: string | null;
}

interface Props {
    orders: { data: Order[]; links: any[]; current_page: number; last_page: number };
}

const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    refunded: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    cancelled: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

export default function ClientOrdersIndex({ orders }: Props) {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Order History', href: '#' }]}>
            <Head title="My Orders" />
            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                <Heading title="Order History" description="View your past purchases and download receipts." />

                {orders.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 mt-4 space-y-4 rounded-2xl border border-dashed border-border/60 bg-muted/20">
                        <ShoppingBag className="size-10 text-muted-foreground" />
                        <h4 className="text-lg font-bold">No Orders Found</h4>
                        <p className="text-muted-foreground text-sm">You haven't made any purchases yet.</p>
                        <Button variant="outline" className="rounded-xl mt-2" asChild>
                            <a href="/products">Browse Shop</a>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {orders.data.map(order => (
                                <Card
                                    key={order.id}
                                    className="rounded-2xl border-border/40 bg-background/50 overflow-hidden shadow-sm hover:shadow-md hover:border-bm-gold/50 cursor-pointer transition-all hover:-translate-y-1 flex flex-col h-full"
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    <CardHeader className="bg-muted/30 border-b border-border/40 py-5">
                                        <div className="flex items-center justify-between gap-3 mb-2">
                                            <CardTitle className="font-mono font-black text-lg tracking-tight truncate" title={order.order_number}>
                                                {order.order_number}
                                            </CardTitle>
                                            <Badge variant="outline" className={`${statusColors[order.status] || 'bg-muted text-foreground'} uppercase text-[10px] font-black tracking-wider rounded-md shrink-0`}>
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center justify-between">
                                            <span className="flex items-center gap-1.5"><Calendar className="size-3.5" /> {new Date(order.created_at).toLocaleDateString()}</span>
                                            {order.items.length > 0 && <span className="flex items-center gap-1.5 font-semibold"><Package className="size-3.5" /> {order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="py-5 flex-1 flex flex-col justify-center">
                                        <div className="text-2xl font-black font-mono tracking-tighter text-emerald-500 mb-1">
                                            ${Number(order.total_amount).toFixed(2)}
                                        </div>
                                        {order.payment_method && (
                                            <div className="text-xs text-muted-foreground flex items-center gap-1.5 capitalize font-medium">
                                                <CreditCard className="size-3.5" /> Paid via {order.payment_method}
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0 mt-auto border-t border-border/20 bg-muted/10">
                                        <Button
                                            asChild
                                            className="w-full mt-4 bg-bm-gold hover:bg-bm-gold/90 text-black font-bold h-10 rounded-xl transition-all"
                                        >
                                            <Link href={`/track-order?number=${order.order_number}`} onClick={(e) => e.stopPropagation()}>
                                                Track Order
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        <Pagination
                            links={orders.links}
                            className="mt-6"
                        />
                    </div>
                )}
            </div>

            {/* Quick View Modal */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="max-w-md sm:max-w-xl rounded-3xl p-0 overflow-hidden border-border/40 bg-background/95 backdrop-blur-xl">
                    {selectedOrder && (
                        <>
                            <DialogHeader className="p-6 bg-muted/30 border-b border-border/40">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <DialogTitle className="font-mono font-black text-2xl tracking-tight mb-1">
                                            {selectedOrder.order_number}
                                        </DialogTitle>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5"><Calendar className="size-4" /> {new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                                            {selectedOrder.payment_method && <span className="flex items-center gap-1.5 capitalize"><CreditCard className="size-4" /> {selectedOrder.payment_method}</span>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className={`${statusColors[selectedOrder.status] || 'bg-muted text-foreground'} uppercase text-xs px-3 py-1 font-black tracking-widest rounded-lg mb-2 inline-block`}>
                                            {selectedOrder.status}
                                        </Badge>
                                        <div className="text-3xl font-black font-mono tracking-tighter text-emerald-500">
                                            ${Number(selectedOrder.total_amount).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </DialogHeader>
                            <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-premium">
                                <h4 className="font-bold uppercase tracking-widest text-xs text-muted-foreground mb-4">Order Line Items</h4>
                                <div className="space-y-3">
                                    {selectedOrder.items.map(item => (
                                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-2xl border border-border/40 bg-muted/20">
                                            <div className="size-14 rounded-xl bg-background border border-border/40 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                                {item.product?.image_path ? (
                                                    <img src={`/storage/${item.product.image_path}`} alt={item.product_name} className="object-cover w-full h-full" />
                                                ) : (
                                                    <Package className="size-6 text-muted-foreground/40" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="font-bold text-sm truncate" title={item.product_name}>{item.product_name}</h5>
                                                <p className="text-xs text-muted-foreground mt-0.5 font-medium">Qty: {item.quantity} × ${Number(item.unit_price).toFixed(2)}</p>
                                            </div>
                                            <div className="font-mono font-bold text-base text-right shrink-0 tracking-tight">
                                                ${Number(item.total_price).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 pt-4 border-t border-border/40 bg-muted/10 flex justify-end">
                                <Button
                                    asChild
                                    className="bg-bm-gold shadow-lg shadow-bm-gold/20 hover:bg-bm-gold-hover text-black font-bold h-12 px-8 rounded-xl w-full sm:w-auto transition-transform active:scale-95"
                                >
                                    <Link href={`/track-order?number=${selectedOrder.order_number}`}>Track Order Progress</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
