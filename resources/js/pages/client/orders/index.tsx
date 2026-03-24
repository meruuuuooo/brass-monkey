import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ShoppingBag, Package, Calendar, DollarSign, Download, ArrowRight, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { Pagination } from '@/components/ui/pagination';

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
                        {orders.data.map(order => (
                            <Card key={order.id} className="rounded-2xl border-border/40 bg-background/50 overflow-hidden shadow-sm">
                                <CardHeader className="bg-muted/30 border-b border-border/40 py-4 flex flex-row items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <CardTitle className="font-mono font-black text-lg tracking-tight">{order.order_number}</CardTitle>
                                            <Badge variant="outline" className={`${statusColors[order.status] || 'bg-muted text-foreground'} uppercase text-[10px] font-black tracking-wider rounded-md`}>
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                                            <span className="flex items-center gap-1.5"><Calendar className="size-3.5" /> {new Date(order.created_at).toLocaleDateString()}</span>
                                            {order.payment_method && <span className="flex items-center gap-1.5 capitalize"><CreditCard className="size-3.5" /> {order.payment_method}</span>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-black font-mono tracking-tighter text-emerald-500">${Number(order.total_amount).toFixed(2)}</div>
                                        <div className="text-xs text-muted-foreground font-semibold uppercase mt-0.5">Total</div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border/40">
                                        {order.items.map(item => (
                                            <div key={item.id} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-12 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center overflow-hidden shrink-0">
                                                        {item.product?.image_path ? (
                                                            <img src={`/storage/${item.product.image_path}`} alt={item.product_name} className="object-cover w-full h-full" />
                                                        ) : (
                                                            <Package className="size-5 text-muted-foreground/50" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm">{item.product_name}</h4>
                                                        <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity} × ${Number(item.unit_price).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                <div className="font-mono font-bold text-sm text-right">
                                                    ${Number(item.total_price).toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        <Pagination
                            links={orders.links}
                            className="mt-6"
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
