import { Link } from '@inertiajs/react';
import { Wrench, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface RecommendedService {
    service_id: number;
    name: string;
    description: string | null;
    price: number | null;
    reason: string;
    last_booked: string | null;
    priority: 'high' | 'medium';
}

interface Props {
    services: RecommendedService[];
}

const priorityStyle = {
    high: { border: 'border-red-500/20', badge: 'bg-red-500/10 text-red-500', label: 'Due for refresh' },
    medium: { border: 'border-bm-gold/20', badge: 'bg-bm-gold/10 text-bm-gold', label: 'Try this next' },
};

export function ClientRecommendedServices({ services }: Props) {
    if (services.length === 0) return null;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Wrench className="size-4 text-bm-gold" />
                <h2 className="text-base font-bold">Recommended for You</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
                {services.map((svc) => {
                    const style = priorityStyle[svc.priority];
                    return (
                        <div
                            key={svc.service_id}
                            className={`rounded-2xl border ${style.border} bg-card p-4 space-y-2 flex flex-col`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <p className="font-bold text-sm leading-snug">{svc.name}</p>
                                <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${style.badge}`}>
                                    {style.label}
                                </span>
                            </div>
                            {svc.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{svc.description}</p>
                            )}
                            {svc.last_booked && (
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                                    <Clock className="size-3" />
                                    Last booked: {svc.last_booked}
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground/50 italic leading-snug">{svc.reason}</p>
                            <div className="mt-auto flex items-center justify-between pt-2">
                                {svc.price !== null && (
                                    <span className="font-mono font-black text-bm-gold text-sm">
                                        ${svc.price.toFixed(2)}
                                    </span>
                                )}
                                <Button
                                    size="sm"
                                    className="ml-auto bg-bm-gold hover:bg-bm-gold/90 text-black font-bold rounded-xl text-xs h-8 px-3"
                                    asChild
                                >
                                    <Link href="/services" className="cursor-pointer">
                                        Book Now <ChevronRight className="size-3 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
