import { Head, Link } from '@inertiajs/react';
import { BarChart3, ShoppingCart, Package, DollarSign, ArrowRight } from 'lucide-react';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

const reports = [
    { title: 'Sales Report', description: 'Revenue, top products, payment methods, daily trends.', href: '/admin/reports/sales', icon: ShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Inventory Report', description: 'Stock levels, valuations, low stock alerts.', href: '/admin/reports/inventory', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Financial Summary', description: 'Payments, refunds, expenses, gross profit.', href: '/admin/reports/financial', icon: DollarSign, color: 'text-bm-gold', bg: 'bg-bm-gold/10' },
];

export default function ReportsIndex() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Reports', href: '#' }]}>
            <Head title="Reports" />
            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                <Heading title="Reports" description="Generate and view system reports." />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {reports.map((r) => (
                        <Link key={r.title} href={r.href} className="group">
                            <Card className="h-full border-border/40 bg-background/50 transition-all hover:border-bm-gold/30 hover:bg-bm-gold/5 shadow-sm rounded-2xl">
                                <CardContent className="p-6 flex flex-col gap-4">
                                    <div className={`size-12 rounded-xl ${r.bg} ${r.color} flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6`}>
                                        <r.icon className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold tracking-tight">{r.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm font-bold text-bm-gold mt-auto">
                                        View Report <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
