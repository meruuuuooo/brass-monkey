import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft, Bell, Send, XCircle, CheckCircle2, Clock, Info, AlertTriangle, Megaphone, Users, Eye, EyeOff,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

interface Recipient { id: number; name: string; email: string; pivot: { is_read: boolean; read_at: string | null }; }

interface Notif {
    id: number; title: string; message: string; type: string; target: string; channel: string; status: string;
    recipients_count: number;
    creator: { id: number; name: string } | null;
    recipients: Recipient[];
    created_at: string; sent_at: string | null;
}

interface Props {
    notification: Notif;
    readCount: number;
    deliverySummary: {
        total: number;
        sent: number;
        failed: number;
        opened: number;
        inApp: number;
        email: number;
    };
}

const typeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    system: { label: 'System', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Info },
    promotional: { label: 'Promo', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: Megaphone },
    alert: { label: 'Alert', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: AlertTriangle },
    info: { label: 'Info', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: Info },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    draft: { label: 'Draft', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: Clock },
    sent: { label: 'Sent', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
};

export default function NotificationShow({ notification, readCount, deliverySummary }: Props) {
    const tCfg = typeConfig[notification.type] || typeConfig.info;
    const sCfg = statusConfig[notification.status] || statusConfig.draft;
    const TypeIcon = tCfg.icon;
    const StatusIcon = sCfg.icon;

    const handleAction = (action: string) => {
        const label = action === 'send' ? 'Send this notification?' : 'Cancel this notification?';
        Swal.fire({ title: label, icon: action === 'send' ? 'question' : 'warning', showCancelButton: true, confirmButtonText: 'Yes' })
            .then((r) => {
                if (r.isConfirmed) {
router.put(`/admin/notifications/${notification.id}`, { action }, {
                    onSuccess: () => Swal.fire('Done!', action === 'send' ? 'Notification sent!' : 'Notification cancelled.', 'success'),
                });
}
            });
    };

    const handleDelete = () => {
        Swal.fire({ title: 'Delete notification?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete' })
            .then((r) => {
                if (r.isConfirmed) {
router.delete(`/admin/notifications/${notification.id}`, {
                    onSuccess: () => Swal.fire('Deleted!', '', 'success'),
                });
}
            });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Notifications', href: '/admin/notifications' }, { title: notification.title, href: '#' }]}>
            <Head title={notification.title} />
            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-4xl">
                {/* Header */}
                <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => router.get('/admin/notifications')}><ArrowLeft className="size-5" /></Button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                {notification.title}
                                <Badge variant="outline" className={`${sCfg.color} rounded-lg text-xs font-bold flex items-center gap-1`}><StatusIcon className="size-3" />{sCfg.label}</Badge>
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Created by {notification.creator?.name} · {new Date(notification.created_at).toLocaleString()}
                                {notification.sent_at && <span> · Sent {new Date(notification.sent_at).toLocaleString()}</span>}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {notification.status === 'draft' && (
                            <Button size="sm" className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold rounded-xl text-xs gap-1" onClick={() => handleAction('send')}>
                                <Send className="size-3" /> Send
                            </Button>
                        )}
                        {['draft', 'scheduled'].includes(notification.status) && (
                            <Button size="sm" variant="outline" className="rounded-xl text-xs text-red-500 border-red-500/20" onClick={() => handleAction('cancel')}>Cancel</Button>
                        )}
                        <Button size="sm" variant="outline" className="rounded-xl text-xs text-red-500 border-red-500/20" onClick={handleDelete}>Delete</Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="border-border/40 bg-background/50 rounded-2xl">
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-bold flex items-center gap-2"><TypeIcon className="size-4 text-bm-gold" />Type & Target</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <div className="text-sm"><span className="text-muted-foreground">Type:</span> <Badge variant="outline" className={`${tCfg.color} rounded-md text-xs`}>{tCfg.label}</Badge></div>
                            <div className="text-sm"><span className="text-muted-foreground">Target:</span> <span className="font-semibold capitalize">{notification.target}</span></div>
                            <div className="text-sm"><span className="text-muted-foreground">Channel:</span> <span className="font-semibold capitalize">{notification.channel.replace('_', '-')}</span></div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/40 bg-background/50 rounded-2xl">
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-bold flex items-center gap-2"><Users className="size-4 text-bm-gold" />Delivery</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <div className="text-sm"><span className="text-muted-foreground">Recipients:</span> <span className="font-bold font-mono">{notification.recipients_count}</span></div>
                            <div className="text-sm"><span className="text-muted-foreground">Read:</span> <span className="font-bold font-mono text-emerald-600">{readCount}</span></div>
                            <div className="text-sm"><span className="text-muted-foreground">Unread:</span> <span className="font-bold font-mono text-amber-500">{notification.recipients_count - readCount}</span></div>
                            <div className="text-sm"><span className="text-muted-foreground">Deliveries:</span> <span className="font-bold font-mono">{deliverySummary.total}</span></div>
                            <div className="text-sm"><span className="text-muted-foreground">Sent:</span> <span className="font-bold font-mono text-emerald-600">{deliverySummary.sent}</span></div>
                            <div className="text-sm"><span className="text-muted-foreground">Failed:</span> <span className="font-bold font-mono text-red-500">{deliverySummary.failed}</span></div>
                            <div className="text-sm"><span className="text-muted-foreground">Opened:</span> <span className="font-bold font-mono text-blue-500">{deliverySummary.opened}</span></div>
                            <div className="text-sm"><span className="text-muted-foreground">In-App:</span> <span className="font-bold font-mono">{deliverySummary.inApp}</span></div>
                            <div className="text-sm"><span className="text-muted-foreground">Email:</span> <span className="font-bold font-mono">{deliverySummary.email}</span></div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/40 bg-background/50 rounded-2xl">
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-bold flex items-center gap-2"><Bell className="size-4 text-bm-gold" />Message</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{notification.message}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recipients */}
                {notification.recipients.length > 0 && (
                    <Card className="border-border/40 bg-background/50 rounded-2xl">
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Recipients ({notification.recipients_count})</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-75 overflow-y-auto">
                                {notification.recipients.map((r) => (
                                    <div key={r.id} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/40">
                                        <div>
                                            <div className="text-sm font-semibold">{r.name}</div>
                                            <div className="text-xs text-muted-foreground">{r.email}</div>
                                        </div>
                                        {r.pivot.is_read ? (
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-md text-xs flex items-center gap-1"><Eye className="size-3" />Read</Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/20 rounded-md text-xs flex items-center gap-1"><EyeOff className="size-3" />Unread</Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
