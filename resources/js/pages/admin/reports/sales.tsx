import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    ShoppingCart, TrendingUp, DollarSign, CreditCard, ArrowLeft,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface DailyRevenue { date: string; orders: number; revenue: string; }
interface TopProduct { product_name: string; total_qty: number; total_revenue: string; }
interface PaymentMethod { payment_method: string; count: number; total: string; }

interface Props {
    filters: { from: string; to: string };
    summary: { totalOrders: number; totalRevenue: number; totalRefunds: number; completedOrders: number; avgOrderValue: number; };
    dailyRevenue: DailyRevenue[];
    topProducts: TopProduct[];
    paymentMethods: PaymentMethod[];
}

const fmt = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2 });

export default function SalesReport({ filters, summary, dailyRevenue, topProducts, paymentMethods }: Props) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    const applyFilter = () => router.get('/admin/reports/sales', { from, to }, { preserveState: true });

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' }, { title: 'Reports', href: '/admin/reports' }, { title: 'Sales', href: '#' },
    ];

    const kpis = [
        { label: 'Total Orders', value: summary.totalOrders, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Total Revenue', value: fmt(summary.totalRevenue), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Refunds', value: fmt(summary.totalRefunds), icon: TrendingUp, color: 'text-red-500', bg: 'bg-red-500/10' },
        { label: 'Avg Order Value', value: fmt(summary.avgOrderValue), icon: CreditCard, color: 'text-bm-gold', bg: 'bg-bm-gold/10' },
    ];

    const maxRev = Math.max(...dailyRevenue.map(d => parseFloat(d.revenue) || 0), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales Report" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => router.get('/admin/reports')}><ArrowLeft className="size-5" /></Button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Sales Report</h1>
                        <p className="text-sm text-muted-foreground">Revenue and order analytics.</p>
                    </div>
                </div>

                {/* Date Filter */}
                <div className="flex flex-wrap items-end gap-3">
                    <div className="grid gap-1.5">
                        <Label className="text-xs font-bold uppercase text-muted-foreground/80">From</Label>
                        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="grid gap-1.5">
                        <Label className="text-xs font-bold uppercase text-muted-foreground/80">To</Label>
                        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl" />
                    </div>
                    <Button onClick={applyFilter} className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold rounded-xl">Apply</Button>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {kpis.map((k) => (
                        <Card key={k.label} className="border-border/40 bg-background/50 rounded-2xl">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{k.label}</p>
                                        <h3 className="text-xl font-black tracking-tight mt-0.5">{k.value}</h3></div>
                                    <div className={`size-10 rounded-xl ${k.bg} ${k.color} flex items-center justify-center`}><k.icon className="size-5" /></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Daily Revenue Chart (simple bar) */}
                    <Card className="border-border/40 bg-background/50 rounded-2xl">
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Daily Revenue</CardTitle></CardHeader>
                        <CardContent>
                            {dailyRevenue.length > 0 ? (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {dailyRevenue.map((d) => (
                                        <div key={d.date} className="flex items-center gap-3">
                                            <span className="text-xs font-mono text-muted-foreground w-20 shrink-0">{d.date}</span>
                                            <div className="flex-1 h-6 bg-muted/30 rounded-lg overflow-hidden">
                                                <div className="h-full bg-bm-gold/60 rounded-lg transition-all flex items-center px-2" style={{ width: `${Math.max(5, (parseFloat(d.revenue) / maxRev) * 100)}%` }}>
                                                    <span className="text-[10px] font-bold text-black whitespace-nowrap">{fmt(parseFloat(d.revenue))}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono text-muted-foreground w-8 text-right">{d.orders}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-center py-8 text-sm text-muted-foreground">No data for this period.</p>}
                        </CardContent>
                    </Card>

                    {/* Top Products */}
                    <Card className="border-border/40 bg-background/50 rounded-2xl">
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Top Products</CardTitle></CardHeader>
                        <CardContent>
                            {topProducts.length > 0 ? (
                                <div className="space-y-2">
                                    {topProducts.map((p, i) => (
                                        <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/40">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                                                <span className="text-sm font-semibold">{p.product_name}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-mono font-bold">{fmt(parseFloat(p.total_revenue))}</div>
                                                <div className="text-[10px] text-muted-foreground">{p.total_qty} sold</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-center py-8 text-sm text-muted-foreground">No products sold.</p>}
                        </CardContent>
                    </Card>
                </div>

                {/* Payment Methods */}
                <Card className="border-border/40 bg-background/50 rounded-2xl">
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Payment Methods</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            {paymentMethods.map((pm) => (
                                <div key={pm.payment_method} className="p-4 rounded-xl bg-muted/30 border border-border/40 min-w-[140px]">
                                    <div className="text-sm font-bold capitalize">{pm.payment_method}</div>
                                    <div className="text-lg font-mono font-bold text-bm-gold">{fmt(parseFloat(pm.total))}</div>
                                    <div className="text-xs text-muted-foreground">{pm.count} transactions</div>
                                </div>
                            ))}
                            {paymentMethods.length === 0 && <p className="text-sm text-muted-foreground">No payment data.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
