import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import {
    Megaphone,
    ExternalLink,
    Clock,
    Link as LinkIcon,
    Image as ImageIcon,
    Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/* ─────────────────────────────────── Types ──────────────────────────────── */

interface Advertisement {
    id: number;
    title: string;
    content: string;
    image_path: string | null;
    link_url: string | null;
    priority: number;
    display_start_at: string | null;
    display_duration_hours: number | null;
    created_at: string;
}

interface Props {
    advertisements: Advertisement[];
}

/* ──────────────────────────────── Helpers ───────────────────────────────── */

function getPriorityMeta(priority: number) {
    if (priority >= 10) return { label: 'Top', cls: 'bg-bm-gold/20 text-bm-gold border-bm-gold/30' };
    if (priority >= 5) return { label: 'High', cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    if (priority < 0) return { label: 'Low', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    return { label: 'Featured', cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
}

function formatExpiry(start: string | null, hours: number | null): string | null {
    if (!start || !hours) return null;
    const expiry = new Date(new Date(start).getTime() + hours * 3600_000);
    return expiry.toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

/* ──────────────────────────────── Card ─────────────────────────────────── */

function PromoCard({ ad }: { ad: Advertisement }) {
    const { label, cls } = getPriorityMeta(ad.priority);
    const expiry = formatExpiry(ad.display_start_at, ad.display_duration_hours);

    return (
        <div className="group relative break-inside-avoid mb-5 rounded-2xl overflow-hidden bg-card border border-border/40 hover:border-bm-gold/30 shadow-sm hover:shadow-lg hover:shadow-bm-gold/5 transition-all duration-300">
            {/* Image */}
            {ad.image_path ? (
                <div className="relative w-full overflow-hidden">
                    <img
                        src={`/storage/${ad.image_path}`}
                        alt={ad.title}
                        className="w-full h-auto block object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
            ) : (
                <div className="w-full aspect-4/3 flex flex-col items-center justify-center bg-bm-gold/5">
                    <ImageIcon className="size-10 text-bm-gold/20" />
                </div>
            )}

            {/* Priority badge */}
            <div className="absolute top-3 left-3 z-10">
                <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 backdrop-blur-sm border ${cls}`}>
                    {label}
                </Badge>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
                <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-bm-gold transition-colors">
                    {ad.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                    {ad.content}
                </p>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    {ad.link_url && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/60">
                            <LinkIcon className="size-2.5" />
                            <span className="truncate max-w-[110px]">{ad.link_url.replace(/^https?:\/\//, '')}</span>
                        </span>
                    )}
                    {expiry && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/60">
                            <Clock className="size-2.5" />
                            Expires {expiry}
                        </span>
                    )}
                </div>

                {/* CTA */}
                {ad.link_url && (
                    <a
                        href={ad.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-bm-gold hover:underline underline-offset-4 transition-colors"
                    >
                        View Offer <ExternalLink className="size-3" />
                    </a>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────── Main Page ──────────────────────────────── */

export default function ClientPromotions({ advertisements }: Props) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Promotions', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Promotions & Offers" />

            <div className="space-y-6 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-bm-gold/10 text-bm-gold">
                            <Megaphone className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">Promotions &amp; Offers</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Exclusive deals and service updates from Brass Monkey.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Empty state */}
                {advertisements.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-bm-gold/20 blur-2xl rounded-full" />
                            <div className="relative p-6 rounded-3xl bg-bm-gold/10 text-bm-gold">
                                <Sparkles className="size-12" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold">No Active Promotions</h3>
                        <p className="text-muted-foreground text-sm mt-2 max-w-sm">
                            Check back soon — exclusive offers and announcements will appear here.
                        </p>
                    </div>
                )}

                {/* Pinterest Masonry Grid */}
                {advertisements.length > 0 && (
                    <>
                        <p className="text-xs text-muted-foreground font-medium">
                            {advertisements.length} active promotion{advertisements.length !== 1 ? 's' : ''}
                        </p>
                        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5">
                            {advertisements.map((ad) => (
                                <PromoCard key={ad.id} ad={ad} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
