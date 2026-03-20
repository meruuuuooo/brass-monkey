import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, ChevronRight, ExternalLink, Package, Search, Sparkles, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import services from '@/routes/services';

interface WorkOrder {
    id: number;
    number: string;
    status: string;
    type: string;
}

interface Advertisement {
    id: number;
    title: string;
    content: string;
    image_path: string | null;
    link_url: string | null;
}

interface Announcement {
    id: number;
    title: string;
    content: string;
    type: 'info' | 'warning' | 'danger' | 'success';
    priority: number;
}

interface Props {
    activeWorkOrders: WorkOrder[];
    advertisements: Advertisement[];
    announcements: Announcement[];
}

export default function ClientDashboard({ 
    activeWorkOrders = [], 
    advertisements = [], 
    announcements = [] 
}: Props) {
    const { auth } = usePage().props;
    const userName = auth.user.name;

    const [currentAdIndex, setCurrentAdIndex] = useState(0);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
    ];

    useEffect(() => {
        if (advertisements.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentAdIndex((prev: number) => (prev + 1) % advertisements.length);
        }, 8000); // 8 seconds per slide

        return () => clearInterval(timer);
    }, [advertisements.length]);

    const nextAd = () => {
        setCurrentAdIndex((prev: number) => (prev + 1) % advertisements.length);
    };

    const prevAd = () => {
        setCurrentAdIndex((prev: number) => (prev - 1 + advertisements.length) % advertisements.length);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Client Dashboard" />

            <div className="flex flex-col gap-6 p-4 md:p-6 lg:flex-row">
                {/* Left Column */}
                <div className="flex flex-1 flex-col gap-6">
                    {/* Welcome Header */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
                            Welcome <span className="text-bm-gold">{userName}</span>!
                        </h1>
                        <p className="text-muted-foreground">Your personal hub for tracking your repair and rental needs.</p>
                    </div>

                    {/* Premium Advertisements Carousel */}
                    {advertisements.length > 0 ? (
                        <div className="relative group/carousel w-full">
                            <div className="overflow-hidden rounded-[2.5rem] bg-background/50 backdrop-blur-2xl border border-white/5 shadow-2xl transition-all duration-700 hover:shadow-bm-gold/10 hover:border-bm-gold/20 h-[500px] lg:h-[450px]">
                                {advertisements.map((ad, index) => (
                                    <div
                                        key={ad.id}
                                        className={cn(
                                            "h-full w-full transition-all duration-1000 ease-in-out absolute inset-0",
                                            index === currentAdIndex ? "opacity-100 translate-x-0 z-20" : "opacity-0 translate-x-12 z-10 pointer-events-none"
                                        )}
                                    >
                                        {/* Desktop Split Layout / Mobile Stacked */}
                                        <div className="flex flex-col lg:flex-row h-full">
                                            {/* Image Area with Cinematic Backdrop */}
                                            {ad.image_path ? (
                                                <div className={cn(
                                                    "relative lg:w-2/5 overflow-hidden h-1/2 lg:h-full shrink-0 group/ad-image",
                                                    index % 2 === 1 ? "lg:order-last border-l border-white/5" : "border-r border-white/5"
                                                )}>
                                                    {/* Blurred Backdrop for "Accurate Sizes" feeling */}
                                                    <div 
                                                        className="absolute inset-0 scale-110 blur-2xl opacity-30 transition-transform duration-1000 group-hover/ad-image:scale-125"
                                                        style={{ 
                                                            backgroundImage: `url(/storage/${ad.image_path})`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center'
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent lg:hidden z-10" />
                                                    
                                                    {/* Main Image - Contain for accuracy */}
                                                    <img
                                                        src={`/storage/${ad.image_path}`}
                                                        alt={ad.title}
                                                        className="relative z-10 h-full w-full object-contain p-4 transition-all duration-1000 group-hover/ad-image:scale-105"
                                                    />
                                                    
                                                    <div className="absolute inset-0 bg-bm-gold/5 mix-blend-overlay z-20" />
                                                </div>
                                            ) : (
                                                <div className="lg:w-2/5 bg-bm-gold/5 flex items-center justify-center border-r border-border/40 h-1/2 lg:h-full shrink-0">
                                                    <Sparkles className="size-24 text-bm-gold/20 animate-pulse" />
                                                </div>
                                            )}

                                            {/* Content Area */}
                                            <div className="flex-1 flex flex-col justify-center p-6 lg:p-12 z-20 overflow-hidden">
                                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bm-gold/10 border border-bm-gold/20 text-bm-gold text-[10px] uppercase font-black tracking-[0.2em] mb-4 lg:mb-6 w-fit shrink-0">
                                                    <Sparkles className="size-3" />
                                                    Featured Promotion
                                                </div>

                                                <h2 className="text-2xl lg:text-5xl font-black tracking-tighter text-foreground mb-4 lg:mb-6 leading-[0.95] break-words line-clamp-2 lg:line-clamp-3">
                                                    {ad.title}
                                                </h2>

                                                <p className="text-base lg:text-lg text-muted-foreground/80 leading-relaxed font-medium mb-6 lg:mb-8 max-w-xl break-words line-clamp-3 lg:line-clamp-4">
                                                    {ad.content}
                                                </p>

                                                {ad.link_url && (
                                                    <Button
                                                        className="w-fit bg-bm-gold hover:bg-bm-gold/90 text-black font-black px-8 lg:px-10 h-12 lg:h-14 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_-12px_rgba(235,188,72,0.4)] group/btn overflow-hidden shrink-0"
                                                        asChild
                                                    >
                                                        <a href={ad.link_url} target="_blank" rel="noopener noreferrer">
                                                            <span className="relative z-10 flex items-center gap-2 text-sm lg:text-base">
                                                                View Details
                                                                <ChevronRight className="size-4 lg:size-5 transition-transform group-hover/btn:translate-x-1" />
                                                            </span>
                                                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Progress Dots */}
                                {advertisements.length > 1 && (
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                                        {advertisements.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentAdIndex(i)}
                                                className={cn(
                                                    "h-1 transition-all duration-500 rounded-full",
                                                    i === currentAdIndex ? "w-8 bg-bm-gold shadow-[0_0_12px_rgba(235,188,72,0.5)]" : "w-1.5 bg-white/20 hover:bg-white/40"
                                                )}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Navigation Controls */}
                            {advertisements.length > 1 && (
                                <>
                                    <button
                                        onClick={prevAd}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 size-12 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-bm-gold hover:text-black z-40 -translate-x-4 group-hover/carousel:translate-x-0"
                                    >
                                        <ChevronRight className="size-6 rotate-180" />
                                    </button>
                                    <button
                                        onClick={nextAd}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 size-12 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-bm-gold hover:text-black z-40 translate-x-4 group-hover/carousel:translate-x-0"
                                    >
                                        <ChevronRight className="size-6" />
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="relative overflow-hidden rounded-[2.5rem] bg-background/50 backdrop-blur-2xl border border-dashed border-border/40 p-12 lg:p-20 text-center flex flex-col items-center gap-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-bm-gold/20 blur-[50px] rounded-full" />
                                <div className="relative h-24 w-24 rounded-3xl bg-bm-gold/10 border border-bm-gold/20 flex items-center justify-center">
                                    <Truck className="size-12 text-bm-gold" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black tracking-tighter">Premium Brass Monkey Services</h3>
                                <p className="text-muted-foreground text-lg max-w-md font-medium">Explore our premium repair, custom builds, and rental services tailored just for you.</p>
                            </div>
                            <Button className="bg-foreground text-background hover:bg-foreground/90 font-black px-12 h-14 rounded-2xl shadow-xl transition-all hover:scale-105" asChild>
                        <Link href={services.index.url()}>
                            Browse All Services
                        </Link>
                    </Button>
                        </div>
                    )}

                    {/* Active Work Order List */}
                    <Card className="overflow-hidden border-border/40 bg-background/50 shadow-sm backdrop-blur-sm rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-bold">Active Work Order List</CardTitle>
                                <p className="text-xs text-muted-foreground">Monitor the progress of your current orders</p>
                            </div>
                            <Link
                                href="/track-order"
                                className="text-sm font-bold text-bm-gold hover:underline flex items-center gap-1 transition-all hover:translate-x-1"
                            >
                                Track Order
                                <ChevronRight className="size-4" />
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            {activeWorkOrders.length > 0 ? (
                                <div className="divide-y divide-border/40">
                                    {activeWorkOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="group flex items-center justify-between p-4 transition-all hover:bg-bm-gold/5"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-bm-gold/20 transition-colors">
                                                    <Package className="size-5 text-muted-foreground group-hover:text-bm-gold transition-colors" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold tracking-tight">{order.number}</span>
                                                    <span className="text-xs text-muted-foreground">{order.type}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="rounded-md border-bm-gold/30 bg-bm-gold/5 text-bm-gold px-2 py-0 text-[10px] uppercase font-bold">
                                                    {order.status}
                                                </Badge>
                                                <Button size="icon" variant="ghost" className="size-8 rounded-lg hover:bg-bm-gold/10 hover:text-bm-gold transition-all">
                                                    <Search className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center flex flex-col items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center opacity-50">
                                        <Package className="size-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground text-sm font-medium">No active work orders found.</p>
                                    <Button variant="outline" size="sm" className="mt-2 rounded-xl text-xs">
                                        Request Service
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Announcements Column */}
                <div className="w-full lg:w-[350px] shrink-0">
                    <Card className="h-full border-border/40 bg-background/50 shadow-sm backdrop-blur-sm rounded-[2rem] flex flex-col overflow-hidden">
                        <CardHeader className="pb-4 pt-6 border-b border-border/40 px-6">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-bm-gold flex items-center gap-2">
                                <Bell className="size-4" />
                                Live Announcements
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                            <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-premium max-h-[calc(100vh-320px)]">
                                {announcements.length > 0 ? (
                                    <div className="space-y-8">
                                        {announcements.map((announcement) => (
                                            <div key={announcement.id} className="space-y-3 group/announcement relative pl-4">
                                                <div className={cn(
                                                    "absolute left-0 top-1 bottom-1 w-0.5 rounded-full transition-all group-hover/announcement:w-1",
                                                    announcement.type === 'danger' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" :
                                                    announcement.type === 'warning' ? "bg-orange-500" :
                                                    announcement.type === 'success' ? "bg-emerald-500" : "bg-bm-gold"
                                                )} />
                                                
                                                <div className="flex items-center gap-2">
                                                    <Badge 
                                                        variant="outline" 
                                                        className={cn(
                                                            "rounded-md px-1.5 py-0 text-[9px] uppercase font-black tracking-wider transition-all",
                                                            announcement.type === 'danger' ? "border-red-500/30 bg-red-500/10 text-red-500" :
                                                            announcement.type === 'warning' ? "border-orange-500/30 bg-orange-500/10 text-orange-500" :
                                                            announcement.type === 'success' ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : 
                                                            "border-bm-gold/30 bg-bm-gold/10 text-bm-gold"
                                                        )}
                                                    >
                                                        {announcement.type === 'danger' ? 'Urgent' : 
                                                         announcement.type === 'warning' ? 'Notice' : 
                                                         announcement.type === 'success' ? 'Update' : 'Info'}
                                                    </Badge>
                                                    {announcement.priority >= 5 && (
                                                        <Sparkles className="size-3 text-bm-gold animate-pulse" />
                                                    )}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <h4 className="text-sm font-black leading-tight group-hover/announcement:text-bm-gold transition-colors tracking-tight">
                                                        {announcement.title}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium line-clamp-4">
                                                        {announcement.content}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                                        <div className="size-16 rounded-3xl bg-muted/20 flex items-center justify-center mb-6">
                                            <BellOff className="size-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">No Broadcasts</p>
                                        <p className="text-[10px] text-muted-foreground mt-2 font-medium">All systems normal. We'll notify you here of any updates.</p>
                                    </div>
                                )}
                            </div>

                        </CardContent>
                    </Card>
                </div>

            </div>
        </AppLayout>
    );
}
