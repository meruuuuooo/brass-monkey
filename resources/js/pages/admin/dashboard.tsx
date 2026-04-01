import { Head, usePage, Link } from '@inertiajs/react';
import {
    ShoppingCart,
    Users,
    TrendingUp,
    Boxes,
    Truck,
    ClipboardList,
    AlertTriangle,
    ArrowUpCircle,
    ArrowDownCircle,
    ClipboardCheck,
    UserPlus,
    DollarSign,
    Package,
    Layers,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { DashboardCalendar } from '@/components/dashboard-calendar';
import { DashboardDueDates } from '@/components/dashboard-due-dates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
];

interface LowStockProduct {
    id: number;
    name: string;
    sku: string | null;
    stock_quantity: number;
    low_stock_threshold: number;
}
interface RecentPO {
    id: number;
    order_number: string;
    supplier: { id: number; name: string } | null;
    status: string;
    total_amount: string;
    created_at: string;
}
interface RecentAdj {
    id: number;
    type: string;
    quantity: number;
    product: { id: number; name: string; sku: string | null } | null;
    adjusted_by: { id: number; name: string } | null;
    created_at: string;
}
interface POStat {
    status: string;
    count: number;
    total: string;
}

interface Props {
    totalClients: number;
    newClientsThisMonth: number;
    calendarItems?: Array<{
        date: string;
        status: 'urgent' | 'pending' | 'completed';
    }>;
    serviceOrders?: Array<{
        id: number;
        tracking_number: string;
        customer_name: string;
        service_type: string;
        status: string;
        estimated_completion: string | null;
        created_at: string;
    }>;
    totalProducts: number;
    activeProducts: number;
    inventoryValue: number;
    retailValue: number;
    lowStockProducts: LowStockProduct[];
    totalSuppliers: number;
    activeSuppliers: number;
    poStats: Record<string, POStat>;
    recentPOs: RecentPO[];
    recentAdjustments: RecentAdj[];
}

const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(n);

const statusColors: Record<string, string> = {
    draft: 'bg-slate-500/10 text-slate-500',
    submitted: 'bg-blue-500/10 text-blue-500',
    approved: 'bg-amber-500/10 text-amber-600',
    received: 'bg-emerald-500/10 text-emerald-600',
    cancelled: 'bg-red-500/10 text-red-500',
};

export default function Dashboard(props: Props) {
    const { auth } = usePage().props;
    const userName = auth.user.name;
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const {
        totalClients,
        newClientsThisMonth,
        calendarItems = [],
        serviceOrders = [],
        totalProducts,
        activeProducts,
        inventoryValue,
        retailValue,
        lowStockProducts,
        totalSuppliers,
        activeSuppliers,
        poStats,
        recentPOs,
        recentAdjustments,
    } = props;

    const pendingPOCount =
        (poStats.draft?.count ?? 0) + (poStats.submitted?.count ?? 0);
    const totalPOValue = Object.values(poStats).reduce(
        (s, p) => s + parseFloat(p.total || '0'),
        0,
    );

    const kpis = [
        {
            label: 'Total Products',
            value: totalProducts,
            sub: `${activeProducts} active`,
            icon: Boxes,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10',
        },
        {
            label: 'Inventory Value',
            value: fmt(inventoryValue),
            sub: `Retail ${fmt(retailValue)}`,
            icon: DollarSign,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
        },
        {
            label: 'Suppliers',
            value: totalSuppliers,
            sub: `${activeSuppliers} active`,
            icon: Truck,
            color: 'text-sky-500',
            bg: 'bg-sky-500/10',
        },
        {
            label: 'Pending POs',
            value: pendingPOCount,
            sub: fmt(totalPOValue) + ' total',
            icon: ClipboardList,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
        },
        {
            label: 'Total Clients',
            value: totalClients,
            sub: `+${newClientsThisMonth} this month`,
            icon: Users,
            color: 'text-bm-gold',
            bg: 'bg-bm-gold/10',
        },
        {
            label: 'Low Stock',
            value: lowStockProducts.length,
            sub: 'items below threshold',
            icon: AlertTriangle,
            color:
                lowStockProducts.length > 0
                    ? 'text-red-500'
                    : 'text-emerald-500',
            bg:
                lowStockProducts.length > 0
                    ? 'bg-red-500/10'
                    : 'bg-emerald-500/10',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 animate-in flex-col gap-6 p-6 duration-500 fade-in md:p-8">
                {/* Welcome */}
                <div className="flex flex-col gap-1">
                    <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                        Welcome <span className="text-bm-gold">{userName}</span>
                        !
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground/80">
                        Here's what's happening today in{' '}
                        <span className="font-bold text-foreground">
                            Brass Monkey
                        </span>
                        .
                    </p>
                </div>

                {/* KPI Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {kpis.map((kpi) => (
                        <Card
                            key={kpi.label}
                            className="group overflow-hidden rounded-2xl border-border/40 bg-background/50 shadow-sm backdrop-blur-sm transition-all hover:border-bm-gold/20 hover:bg-bm-gold/5"
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">
                                            {kpi.label}
                                        </p>
                                        <h3 className="origin-left text-xl font-black tracking-tight transition-all group-hover:scale-105">
                                            {kpi.value}
                                        </h3>
                                        <p className="text-[10px] font-medium text-muted-foreground/50">
                                            {kpi.sub}
                                        </p>
                                    </div>
                                    <div
                                        className={`flex size-10 items-center justify-center rounded-xl ${kpi.bg} ${kpi.color} transition-all group-hover:scale-110 group-hover:rotate-12`}
                                    >
                                        <kpi.icon className="size-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Grid */}
                <div className="grid flex-1 gap-6 lg:grid-cols-3">
                    {/* Calendar */}
                    <Card className="flex flex-col overflow-hidden rounded-2xl border-border/40 bg-background/50 shadow-sm backdrop-blur-sm lg:col-span-2">
                        <CardContent className="flex-1 p-5">
                            <DashboardCalendar
                                selectedDate={selectedDate}
                                onDateSelect={setSelectedDate}
                                items={calendarItems}
                            />
                        </CardContent>
                    </Card>

                    {/* Due Dates */}
                    <Card className="flex flex-col overflow-hidden rounded-2xl border-border/40 bg-background/50 shadow-sm backdrop-blur-sm">
                        <CardContent className="flex-1 p-5">
                            <DashboardDueDates
                                selectedDate={selectedDate}
                                onClearSelection={() => setSelectedDate(null)}
                                serviceOrders={serviceOrders}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Low Stock Alerts */}
                    <Card className="rounded-2xl border-border/40 bg-background/50 shadow-sm backdrop-blur-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-bold">
                                <AlertTriangle className="size-4 text-red-500" />
                                Low Stock Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="max-h-[280px] space-y-2 overflow-y-auto">
                            {lowStockProducts.length > 0 ? (
                                lowStockProducts.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between rounded-xl border border-red-500/10 bg-red-500/5 p-2.5"
                                    >
                                        <div>
                                            <div className="text-sm font-semibold">
                                                {p.name}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {p.sku || 'No SKU'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono text-sm font-bold text-red-500">
                                                {p.stock_quantity}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                min: {p.low_stock_threshold}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-sm text-muted-foreground">
                                    <Package className="mx-auto mb-2 size-8 text-emerald-500/50" />
                                    All products are well-stocked!
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Purchase Orders */}
                    <Card className="rounded-2xl border-border/40 bg-background/50 shadow-sm backdrop-blur-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                                    <ClipboardList className="size-4 text-bm-gold" />
                                    Recent Purchase Orders
                                </CardTitle>
                                <Link
                                    href="/admin/purchase-orders"
                                    className="text-[10px] font-bold text-bm-gold hover:underline"
                                >
                                    View All
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="max-h-[280px] space-y-2 overflow-y-auto">
                            {recentPOs.length > 0 ? (
                                recentPOs.map((po) => (
                                    <div
                                        key={po.id}
                                        className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/30 p-2.5"
                                    >
                                        <div>
                                            <div className="font-mono text-sm font-semibold">
                                                {po.order_number}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {po.supplier?.name ?? '—'}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 text-right">
                                            <Badge
                                                variant="outline"
                                                className={`rounded-md px-1.5 text-[10px] ${statusColors[po.status] || ''}`}
                                            >
                                                {po.status}
                                            </Badge>
                                            <div className="font-mono text-[10px] text-muted-foreground">
                                                {fmt(
                                                    parseFloat(po.total_amount),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-sm text-muted-foreground">
                                    No purchase orders yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Stock Adjustments */}
                    <Card className="rounded-2xl border-border/40 bg-background/50 shadow-sm backdrop-blur-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                                    <ClipboardCheck className="size-4 text-blue-500" />
                                    Recent Stock Changes
                                </CardTitle>
                                <Link
                                    href="/admin/stock-adjustments"
                                    className="text-[10px] font-bold text-bm-gold hover:underline"
                                >
                                    View All
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="max-h-[280px] space-y-2 overflow-y-auto">
                            {recentAdjustments.length > 0 ? (
                                recentAdjustments.map((adj) => (
                                    <div
                                        key={adj.id}
                                        className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/30 p-2.5"
                                    >
                                        <div className="flex items-center gap-2">
                                            {adj.type === 'addition' ? (
                                                <ArrowUpCircle className="size-4 text-emerald-500" />
                                            ) : adj.type === 'subtraction' ? (
                                                <ArrowDownCircle className="size-4 text-red-500" />
                                            ) : (
                                                <ClipboardCheck className="size-4 text-blue-500" />
                                            )}
                                            <div>
                                                <div className="text-sm font-semibold">
                                                    {adj.product?.name ?? '—'}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">
                                                    {adj.adjusted_by?.name} ·{' '}
                                                    {new Date(
                                                        adj.created_at,
                                                    ).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <span
                                            className={`font-mono text-sm font-bold ${adj.type === 'addition' ? 'text-emerald-600' : adj.type === 'audit' ? 'text-blue-500' : 'text-red-500'}`}
                                        >
                                            {adj.type === 'addition'
                                                ? '+'
                                                : adj.type === 'audit'
                                                  ? '='
                                                  : '-'}
                                            {adj.quantity}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-sm text-muted-foreground">
                                    No adjustments recorded.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
