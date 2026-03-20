import { Head, usePage } from '@inertiajs/react';
import { ShoppingCart, Users, TrendingUp } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { DashboardCalendar } from '@/components/dashboard-calendar';
import { DashboardDueDates } from '@/components/dashboard-due-dates';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

interface Props {
    totalClients: number;
}

export default function Dashboard({ totalClients }: Props) {
    const { auth } = usePage().props;
    const userName = auth.user.name;
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const stats = [
        { label: 'Sales', v: '$12,450.00', icon: ShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Rentals', v: '84 Units', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    ];

    // Mock data for calendar dots
    const calendarItems = [
        { date: new Date().toISOString().split('T')[0], status: 'urgent' as const },
        { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], status: 'urgent' as const },
        { date: new Date(Date.now() - 86400000).toISOString().split('T')[0], status: 'completed' as const },
    ];

    // Helper component for stats cards
    const StatsCard = ({ title, value, icon: Icon, color, bg }: {
        title: string;
        value: string | number;
        icon: any;
        color: string;
        bg: string;
    }) => (
        <Card className="group overflow-hidden border-border/40 bg-background/50 transition-all hover:bg-bm-gold/5 hover:border-bm-gold/20 shadow-sm backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{title}</p>
                        <h3 className="text-2xl font-black tracking-tight text-foreground transition-all group-hover:scale-110 group-hover:translate-x-1 origin-left">{value}</h3>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg} ${color} transition-all duration-300 group-hover:rotate-12 group-hover:scale-110`}>
                        <Icon className="size-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-8 animate-in fade-in duration-500">
                {/* Welcome Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground sm:text-4xl">
                        Welcome <span className="text-bm-gold">{userName}</span>!
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground/80 flex items-center gap-2">
                        Here's what's happening today in <span className="text-foreground font-bold">Brass Monkey</span>.
                    </p>
                </div>

                {/* Top Stats Grid */}
                <div className="grid gap-6 md:grid-cols-3">
                    {stats.map((stat) => (
                        <StatsCard
                            key={stat.label}
                            title={stat.label}
                            value={stat.v}
                            icon={stat.icon}
                            color={stat.color}
                            bg={stat.bg}
                        />
                    ))}
                    <StatsCard
                        title="TOTAL CLIENT NUMBER"
                        value={totalClients.toLocaleString()}
                        icon={Users}
                        color="text-bm-gold"
                        bg="bg-bm-gold/10"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid flex-1 gap-6 lg:grid-cols-3">
                    {/* Left: Calendar (Column span 2) */}
                    <Card className="flex flex-col overflow-hidden border-border/40 bg-background/50 lg:col-span-2 shadow-sm backdrop-blur-sm rounded-2xl">
                        <CardContent className="p-6 flex-1">
                            <DashboardCalendar 
                                selectedDate={selectedDate} 
                                onDateSelect={setSelectedDate}
                                items={calendarItems}
                            />
                        </CardContent>
                    </Card>

                    {/* Right: Due Dates (Column span 1) */}
                    <Card className="flex flex-col overflow-hidden border-border/40 bg-background/50 shadow-sm backdrop-blur-sm rounded-2xl">
                        <CardContent className="p-6 flex-1">
                            <DashboardDueDates 
                                selectedDate={selectedDate} 
                                onClearSelection={() => setSelectedDate(null)}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
