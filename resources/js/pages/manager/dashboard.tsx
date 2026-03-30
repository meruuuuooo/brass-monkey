import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    Activity, ArrowUpRight, DollarSign, Package, ShoppingCart, AlertTriangle, Wrench, Clock, CheckCircle2, UserCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';

interface Props {
    todaysOrders: number;
    todaysRevenue: number;
    pendingJobs: number;
    myJobsCount: number;
    lowStockProducts: any[];
    recentOrders: any[];
    recentJobs: any[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-500', icon: Clock },
    accepted: { label: 'Accepted', color: 'bg-blue-500/10 text-blue-500', icon: CheckCircle2 },
    'in-progress': { label: 'In Progress', color: 'bg-purple-500/10 text-purple-500', icon: Wrench },
    completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-600', icon: CheckCircle2 },
};

export default function ManagerDashboard({
    todaysOrders, todaysRevenue, pendingJobs, myJobsCount,
    lowStockProducts, recentOrders, recentJobs,
}: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Manager Dashboard" />
            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between">
                    <Heading title="Operations Dashboard" description="Overview of today's sales, service jobs, and inventory alerts." />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="rounded-2xl border-border/40 bg-background/50 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Today's Revenue</CardTitle>
                            <DollarSign className="size-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black font-mono tracking-tight">${Number(todaysRevenue).toFixed(2)}</div>
                            <p className="text-xs flex items-center text-muted-foreground mt-1 font-medium">Daily net sales</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border/40 bg-background/50 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Today's Orders</CardTitle>
                            <ShoppingCart className="size-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black font-mono tracking-tight">{todaysOrders}</div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">Orders placed today</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border/40 bg-background/50 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pending Jobs</CardTitle>
                            <Wrench className="size-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black font-mono tracking-tight">{pendingJobs}</div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">Service orders awaiting action</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border/40 bg-background/50 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">My Active Jobs</CardTitle>
                            <UserCircle2 className="size-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black font-mono tracking-tight">{myJobsCount}</div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">Assigned to you</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="col-span-2 rounded-2xl border-border/40 bg-background/50 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Wrench className="size-5 text-bm-gold" />Recent Service Jobs</CardTitle>
                            <CardDescription>Latest service requests and ongoing repairs.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentJobs.length === 0 ? (
                                <div className="text-sm text-muted-foreground py-8 text-center border rounded-xl border-dashed border-border/60">No recent jobs.</div>
                            ) : (
                                <div className="space-y-4">
                                    {recentJobs.map(job => {
                                        const cfg = statusConfig[job.status] || statusConfig.pending;
                                        return (
                                            <div key={job.id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-background/30 hover:bg-muted/30 transition-colors">
                                                <div>
                                                    <Link href={`/admin/service-requests/${job.id}`} className="font-semibold font-mono text-sm hover:text-bm-gold transition-colors block">
                                                        {job.tracking_number}
                                                    </Link>
                                                    <div className="text-xs text-muted-foreground mt-0.5">{job.customer?.name} • {job.service?.name}</div>
                                                </div>
                                                <Badge variant="outline" className={`${cfg.color} border-transparent font-bold capitalize`}>{cfg.label}</Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="rounded-2xl border-border/40 bg-background/50 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><AlertTriangle className="size-5 text-red-500" />Low Stock Alerts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {lowStockProducts.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">Inventory levels are healthy.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {lowStockProducts.map(p => (
                                            <div key={p.id} className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <Link href={`/admin/products`} className="text-sm font-semibold hover:text-bm-gold">{p.name}</Link>
                                                    <span className="text-xs font-mono text-muted-foreground">{p.sku}</span>
                                                </div>
                                                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-transparent font-mono">{p.stock_quantity} left</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl border-border/40 bg-background/50 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><ShoppingCart className="size-5 text-blue-500" />Recent Orders</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentOrders.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">No recent orders.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {recentOrders.slice(0, 5).map(o => (
                                            <div key={o.id} className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <Link href={`/admin/orders/${o.id}`} className="text-sm font-semibold font-mono hover:text-bm-gold">{o.order_number}</Link>
                                                    <span className="text-xs text-muted-foreground">{o.customer?.name}</span>
                                                </div>
                                                <span className="text-sm font-black font-mono">${Number(o.total_amount).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
