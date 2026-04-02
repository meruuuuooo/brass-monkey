import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronRight, ExternalLink, Package, Search, Sparkles, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ClientPendingActions, type PendingAction } from '@/components/client-pending-actions';
import { ClientRecommendedProducts, type RecommendedProduct } from '@/components/client-recommended-products';
import { ClientRecommendedServices, type RecommendedService } from '@/components/client-recommended-services';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import AppLayout from '@/layouts/app-layout';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
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
    display_start_at: string | null;
    display_duration_hours: number | null;
}

interface Props {
    activeWorkOrders: WorkOrder[];
    advertisements: Advertisement[];
    pending_actions: PendingAction[];
    recommended_services: RecommendedService[];
    recommended_products: RecommendedProduct[];
}

export default function ClientDashboard({
    activeWorkOrders = [],
    advertisements = [],
    pending_actions = [],
    recommended_services = [],
    recommended_products = [],
}: Props) {
    const { auth } = usePage().props;
    const userName = auth.user.name;

    const [currentAdIndex, setCurrentAdIndex] = useState(0);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
    ];

    useEffect(() => {
        if (advertisements.length <= 1) {
            return;
        }
        const timer = setInterval(() => {
            setCurrentAdIndex((prev: number) => (prev + 1) % advertisements.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [advertisements.length]);

    const nextAd = () => {
        setCurrentAdIndex((prev: number) => (prev + 1) % advertisements.length);
    };

    const prevAd = () => {
        setCurrentAdIndex((prev: number) => (prev - 1 + advertisements.length) % advertisements.length);
    };

    return (
        <AppHeaderLayout>
            <Head title="Client Dashboard" />

            <div className="flex flex-col gap-8 p-4 md:p-6 lg:flex-row">
                {/* Left Column */}
                <div className="flex flex-1 flex-col gap-8">
                    {/* Welcome Header */}
                    <div className="flex flex-col gap-3 pb-2">
                        <div className="space-y-1">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                                Welcome back, <span className="text-bm-gold">{userName}</span>
                            </h1>
                            <p className="text-base md:text-lg text-muted-foreground font-medium">Your personal hub for tracking repairs, rentals, and services</p>
                        </div>
                    </div>

                    {/* ── Action Required Banner ── */}
                    {pending_actions.length > 0 && (
                        <div className="py-2">
                            <ClientPendingActions actions={pending_actions} />
                        </div>
                    )}

                    {/* Premium Advertisements Carousel */}
                    {advertisements.length > 0 ? (
                        <div className="relative group/carousel w-full">
                            <div className="overflow-hidden rounded-[2.5rem] bg-background/50 backdrop-blur-2xl border border-white/5 shadow-2xl transition-all duration-700 hover:shadow-bm-gold/10 hover:border-bm-gold/20 h-100 lg:h-70">
                                {advertisements.map((ad, index) => (
                                    <div
                                        key={ad.id}
                                        className={cn(
                                            "h-full w-full transition-all duration-1000 ease-in-out absolute inset-0",
                                            index === currentAdIndex ? "opacity-100 translate-x-0 z-20" : "opacity-0 translate-x-12 z-10 pointer-events-none"
                                        )}
                                    >
                                        <div className="flex flex-col lg:flex-row h-full">
                                            {ad.image_path ? (
                                                <div className={cn(
                                                    "relative lg:w-2/5 overflow-hidden h-40 lg:h-full shrink-0 group/ad-image",
                                                    index % 2 === 1 ? "lg:order-last border-l border-white/5" : "border-r border-white/5"
                                                )}>
                                                    <div
                                                        className="absolute inset-0 scale-110 blur-2xl opacity-30 transition-transform duration-1000 group-hover/ad-image:scale-125"
                                                        style={{ backgroundImage: `url(/storage/${ad.image_path})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                                    />
                                                    <div className="absolute inset-0 bg-linear-to-t from-background/90 via-transparent to-transparent lg:hidden z-10" />
                                                    <img
                                                        src={`/storage/${ad.image_path}`}
                                                        alt={ad.title}
                                                        className="relative z-10 h-full w-full object-contain p-4 transition-all duration-1000 group-hover/ad-image:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-bm-gold/5 mix-blend-overlay z-20" />
                                                </div>
                                            ) : (
                                                <div className="lg:w-2/5 bg-bm-gold/5 flex items-center justify-center border-r border-border/40 h-40 lg:h-full shrink-0">
                                                    <Sparkles className="size-24 text-bm-gold/20 animate-pulse" />
                                                </div>
                                            )}
                                            <div className="flex-1 flex flex-col justify-center p-6 lg:p-8 z-20 overflow-hidden">
                                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bm-gold/10 border border-bm-gold/20 text-bm-gold text-[10px] uppercase font-black tracking-[0.2em] mb-3 lg:mb-4 w-fit shrink-0">
                                                    <Sparkles className="size-3" />
                                                    Featured Promotion
                                                </div>
                                                <h2 className="text-xl lg:text-3xl font-black tracking-tighter text-foreground mb-3 lg:mb-4 leading-[1.1] wrap-break-word line-clamp-2 lg:line-clamp-3">
                                                    {ad.title}
                                                </h2>
                                                <p className="text-sm lg:text-base text-muted-foreground/80 leading-relaxed font-medium mb-4 lg:mb-6 max-w-xl wrap-break-word line-clamp-3 lg:line-clamp-3">
                                                    {ad.content}
                                                </p>
                                                {ad.link_url && (
                                                    <Button
                                                        className="w-fit bg-bm-gold hover:bg-bm-gold/90 text-black font-black px-6 lg:px-8 h-10 lg:h-12 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_-12px_rgba(235,188,72,0.4)] group/btn overflow-hidden shrink-0"
                                                        asChild
                                                    >
                                                        <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                                                            <span className="relative z-10 flex items-center gap-2 text-sm lg:text-sm">
                                                                View Details
                                                                <ChevronRight className="size-4 lg:size-4 transition-transform group-hover/btn:translate-x-1" />
                                                            </span>
                                                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            {advertisements.length > 1 && (
                                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30 bg-black/30 backdrop-blur-xl px-3 py-2 rounded-full border border-white/10">
                                    {advertisements.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentAdIndex(i)}
                                            className={cn(
                                                "h-1.5 transition-all duration-500 rounded-full cursor-pointer ring-1 ring-transparent hover:ring-bm-gold/50",
                                                i === currentAdIndex ? "w-8 bg-bm-gold shadow-[0_0_12px_rgba(235,188,72,0.6)]" : "w-2 bg-white/25 hover:bg-white/50"
                                            )}
                                            aria-label={`Go to slide ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        {advertisements.length > 1 && (
                            <>
                                <button
                                    onClick={prevAd}
                                    aria-label="Previous promotion"
                                    className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 size-11 md:size-12 rounded-xl bg-black/30 backdrop-blur-md border border-white/15 hover:border-bm-gold/50 flex items-center justify-center text-white hover:text-bm-gold opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-bm-gold/20 z-40 hover:-translate-x-1"
                                >
                                    <ChevronRight className="size-6 rotate-180" />
                                </button>
                                <button
                                    onClick={nextAd}
                                    aria-label="Next promotion"
                                    className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 size-11 md:size-12 rounded-xl bg-black/30 backdrop-blur-md border border-white/15 hover:border-bm-gold/50 flex items-center justify-center text-white hover:text-bm-gold opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-bm-gold/20 z-40 hover:translate-x-1"
                                >
                                    <ChevronRight className="size-6" />
                                </button>
                            </>
                        )}
                        </div>
                    ) : (
                        <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-bm-gold/8 via-background/50 to-background/30 backdrop-blur-2xl border border-bm-gold/20 p-8 md:p-12 lg:p-16 flex flex-col items-center justify-center min-h-70 shadow-lg shadow-bm-gold/5">
                            <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-md">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-bm-gold/20 blur-2xl rounded-full animate-pulse" />
                                    <div className="relative h-20 w-20 rounded-2xl bg-bm-gold/10 border border-bm-gold/30 flex items-center justify-center">
                                        <Truck className="size-10 text-bm-gold" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Featured Offers</h3>
                                    <p className="text-sm md:text-base text-muted-foreground font-medium">No active promotions right now. Browse our services to find what you need.</p>
                                </div>
                                <Button
                                    className="bg-bm-gold hover:bg-bm-gold/90 text-black font-black px-8 h-11 rounded-xl shadow-lg shadow-bm-gold/30 transition-all hover:scale-105 active:scale-95"
                                    asChild
                                >
                                    <Link href={services.index.url()} className="cursor-pointer">Explore Services</Link>
                                </Button>
                            </div>
                            <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent z-0" />
                        </div>
                    )}

                    {/* ── Recommended Services ── */}
                    <ClientRecommendedServices services={recommended_services} />

                    {/* ── Recommended Products ── */}
                    <ClientRecommendedProducts products={recommended_products} />

                    {/* Active Work Order List */}
                    <Card className="overflow-hidden border-border/40 bg-background/50 shadow-md backdrop-blur-sm rounded-2xl">
                        <CardHeader className="pb-4 border-b border-border/30 bg-white/2.5">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div className="space-y-1.5">
                                    <CardTitle className="text-xl md:text-2xl font-black tracking-tight">Active Work Orders</CardTitle>
                                    <p className="text-xs md:text-sm text-muted-foreground font-medium">Track the status of your current repairs and services</p>
                                </div>
                                <Link
                                    href="/track-order"
                                    className="inline-flex items-center gap-1.5 text-sm font-bold text-bm-gold hover:text-bm-gold/80 transition-all hover:translate-x-1 cursor-pointer whitespace-nowrap"
                                >
                                    View All
                                    <ChevronRight className="size-4" />
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {activeWorkOrders.length > 0 ? (
                                <div className="divide-y divide-border/30">
                                    {activeWorkOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="group flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 p-4 transition-all hover:bg-bm-gold/3"
                                        >
                                            <div className="flex items-start md:items-center gap-4 flex-1 min-w-0">
                                                <div className="h-12 w-12 rounded-xl bg-bm-gold/10 border border-bm-gold/20 flex items-center justify-center group-hover:bg-bm-gold/15 transition-colors shrink-0">
                                                    <Package className="size-6 text-bm-gold" />
                                                </div>
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <p className="font-bold tracking-tight text-foreground group-hover:text-bm-gold transition-colors">{order.number}</p>
                                                    <p className="text-xs md:text-sm text-muted-foreground font-medium">{order.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                                                <Badge
                                                    variant="outline"
                                                    className="rounded-lg border-bm-gold/40 bg-bm-gold/8 text-bm-gold px-3 py-1 text-xs font-bold uppercase tracking-wider"
                                                >
                                                    {order.status}
                                                </Badge>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="size-9 rounded-lg hover:bg-bm-gold/10 hover:text-bm-gold transition-all cursor-pointer shrink-0"
                                                    title="View details"
                                                >
                                                    <ChevronRight className="size-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 md:p-12 text-center flex flex-col items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-bm-gold/10 border border-bm-gold/20 flex items-center justify-center">
                                        <Package className="size-7 text-bm-gold/60" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-muted-foreground text-base font-semibold">No active work orders</p>
                                        <p className="text-sm text-muted-foreground/70 max-w-xs">Start a new repair, build, or rental to see your orders here.</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3 rounded-lg text-xs font-semibold border-bm-gold/30 hover:bg-bm-gold/5 hover:text-bm-gold transition-all cursor-pointer"
                                    >
                                        Request Service
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppHeaderLayout>
    );
}
