import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Bell, BellOff, Calendar, CheckCircle2, Info, Megaphone, AlertTriangle, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

interface Notification {
    id: number; title: string; message: string; type: string; created_at: string;
    pivot: { is_read: boolean; read_at: string | null };
}

interface Props {
    notifications: { data: Notification[]; links: any[] };
}

const typeConfig: Record<string, { color: string; icon: React.ElementType }> = {
    system: { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: Info },
    promotional: { color: 'text-bm-gold bg-bm-gold/10 border-bm-gold/20', icon: Megaphone },
    alert: { color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: AlertTriangle },
    info: { color: 'text-slate-500 bg-slate-500/10 border-slate-500/20', icon: Info },
};

export default function NotificationsIndex({ notifications }: Props) {
    const markAsRead = (id: number) => router.post(`/notifications/${id}/read`, {}, { preserveScroll: true });
    const markAllRead = () => router.post('/notifications/mark-all-read', {}, { preserveScroll: true });

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Notifications', href: '#' }]}>
            <Head title="Notifications" />
            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto w-full">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading title="Notifications" description="Stay updated with order alerts and service news." />
                    {notifications.data.some(n => !n.pivot.is_read) && (
                        <Button variant="outline" size="sm" onClick={markAllRead} className="rounded-xl border-border/40 hover:bg-muted/50">
                            <Check className="size-4 mr-2" /> Mark all as read
                        </Button>
                    )}
                </div>

                {notifications.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 mt-4 space-y-4 rounded-2xl border border-dashed border-border/60 bg-muted/20 text-center">
                        <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center mb-2">
                            <BellOff className="size-8 text-muted-foreground/40" />
                        </div>
                        <h4 className="text-lg font-bold">All caught up!</h4>
                        <p className="text-muted-foreground text-sm max-w-xs">You have no notifications at the moment. Keep an eye out for updates here.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.data.map(notif => {
                            const cfg = typeConfig[notif.type] || typeConfig.info;
                            const Icon = cfg.icon;
                            return (
                                <Card key={notif.id} className={cn(
                                    "rounded-2xl border-border/40 transition-all shadow-none overflow-hidden",
                                    !notif.pivot.is_read ? "bg-bm-gold/5 border-bm-gold/20" : "bg-background/50 grayscale-[0.5]"
                                )}>
                                    <CardContent className="p-4 sm:p-5 flex gap-4">
                                        <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0 border", cfg.color)}>
                                            <Icon className="size-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className={cn("text-sm font-bold flex items-center gap-2", !notif.pivot.is_read ? "text-foreground" : "text-muted-foreground")}>
                                                    {notif.title}
                                                    {!notif.pivot.is_read && <span className="size-1.5 rounded-full bg-bm-gold animate-pulse" />}
                                                </h4>
                                                <span className="text-[10px] whitespace-nowrap text-muted-foreground font-medium uppercase tracking-wider">{new Date(notif.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className={cn("text-sm mt-1 leading-relaxed line-clamp-2", !notif.pivot.is_read ? "text-muted-foreground" : "text-muted-foreground/60")}>
                                                {notif.message}
                                            </p>
                                            {!notif.pivot.is_read && (
                                                <button onClick={() => markAsRead(notif.id)} className="mt-3 text-[11px] font-black uppercase tracking-widest text-bm-gold hover:underline">
                                                    Mark as read
                                                </button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                        <Pagination links={notifications.links} className="mt-6" />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
