import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    DollarSign, ArrowLeft, TrendingUp, TrendingDown, UserPlus, ShoppingCart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface DailyTxn { date: string; type: string; total: string; }

interface Props {
    filters: { from: string; to: string };
    summary: { totalPayments: number; totalRefunds: number; netRevenue: number; totalPurchases: number; grossProfit: number; newCustomers: number; };
    dailyTransactions: DailyTxn[];
}

const fmt = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2 });

export default function FinancialReport({ filters, summary, dailyTransactions }: Props) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);
    const applyFilter = () => router.get('/admin/reports/financial', { from, to }, { preserveState: true });

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' }, { title: 'Reports', href: '/admin/reports' }, { title: 'Financial', href: '#' },
    ];

    const kpis = [
        { label: 'Total Payments', value: fmt(summary.totalPayments), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Total Refunds', value: fmt(summary.totalRefunds), icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-500/10' },
        { label: 'Net Revenue', value: fmt(summary.netRevenue), icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Purchases (Cost)', value: fmt(summary.totalPurchases), icon: ShoppingCart, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Gross Profit', value: fmt(summary.grossProfit), icon: DollarSign, color: summary.grossProfit >= 0 ? 'text-emerald-500' : 'text-red-500', bg: summary.grossProfit >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10' },
        { label: 'New Customers', value: summary.newCustomers, icon: UserPlus, color: 'text-bm-gold', bg: 'bg-bm-gold/10' },
    ];

    // Group daily transactions by date
    const dailyMap = new Map<string, { payments: number; refunds: number }>();
    dailyTransactions.forEach((t) => {
        const entry = dailyMap.get(t.date) || { payments: 0, refunds: 0 };
        if (t.type === 'payment') entry.payments += parseFloat(t.total);
        else if (t.type === 'refund') entry.refunds += parseFloat(t.total);
        dailyMap.set(t.date, entry);
    });
    const dailyData = Array.from(dailyMap.entries()).map(([date, d]) => ({ date, ...d, net: d.payments - d.refunds }));
    const maxVal = Math.max(...dailyData.map((d) => Math.max(d.payments, d.refunds)), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Summary" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-end gap-3">
                    <div className="grid gap-1.5"><Label className="text-xs font-bold uppercase text-muted-foreground/80">From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl" /></div>
                    <div className="grid gap-1.5"><Label className="text-xs font-bold uppercase text-muted-foreground/80">To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl" /></div>
                    <Button onClick={applyFilter} className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold rounded-xl">Apply</Button>
                </div>

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

                {/* Daily Breakdown */}
                <Card className="border-border/40 bg-background/50 rounded-2xl">
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Daily Breakdown</CardTitle></CardHeader>
                    <CardContent>
                        {dailyData.length > 0 ? (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                {dailyData.map((d) => (
                                    <div key={d.date} className="p-3 rounded-xl bg-muted/30 border border-border/40">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-mono text-muted-foreground">{d.date}</span>
                                            <span className={`text-sm font-mono font-bold ${d.net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>Net: {fmt(d.net)}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <div className="text-[10px] text-muted-foreground/60 mb-1">Payments</div>
                                                <div className="h-4 bg-muted/30 rounded overflow-hidden">
                                                    <div className="h-full bg-emerald-500/50 rounded" style={{ width: `${(d.payments / maxVal) * 100}%` }} />
                                                </div>
                                                <span className="text-[10px] font-mono text-emerald-600">{fmt(d.payments)}</span>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-muted-foreground/60 mb-1">Refunds</div>
                                                <div className="h-4 bg-muted/30 rounded overflow-hidden">
                                                    <div className="h-full bg-red-500/50 rounded" style={{ width: `${(d.refunds / maxVal) * 100}%` }} />
                                                </div>
                                                <span className="text-[10px] font-mono text-red-500">{fmt(d.refunds)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-center py-8 text-sm text-muted-foreground">No transactions for this period.</p>}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
