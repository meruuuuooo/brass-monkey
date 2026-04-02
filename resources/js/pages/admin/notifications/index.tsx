import { Head, router, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Search, Filter, Plus, Send,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { DataTableWithPagination } from '@/components/data-table';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { notificationStatusConfig, notificationTypeConfig } from '@/lib/crm-config';

interface Notif {
    id: number; title: string; type: string; target: string; channel: string; status: string;
    recipients_count: number;
    creator: { id: number; name: string } | null;
    created_at: string; sent_at: string | null;
}

interface PaginatedNotifs {
    data: Notif[];
    current_page: number; last_page: number; per_page: number; total: number;
    prev_page_url: string | null; next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    notifications: PaginatedNotifs;
    filters: { type?: string; status?: string; search?: string };
}

export default function NotificationsIndex({ notifications, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [open, setOpen] = useState(false);
    const [submitAction, setSubmitAction] = useState<'draft' | 'send' | null>(null);

    const form = useForm({
        title: '', message: '', type: 'info', target: 'all', channel: 'in_app', send_now: false,
    });

    const handleSubmit = (sendNow: boolean) => {
        setSubmitAction(sendNow ? 'send' : 'draft');
        form.setData('send_now', sendNow);
        form.post('/admin/notifications', {
            onSuccess: () => {
                setOpen(false);
                form.reset();
                Swal.fire('Done!', sendNow ? 'Notification sent!' : 'Saved as draft.', 'success');
            },
            onFinish: () => setSubmitAction(null),
        });
    };

    const handleSearch = () => {
        router.get('/admin/notifications', { ...filters, search: search || undefined }, { preserveState: true });
    };

    const handleFilter = (k: string, v: string | undefined) => {
        router.get('/admin/notifications', { ...filters, [k]: v }, { preserveState: true });
    };

    const columns: ColumnDef<Notif>[] = useMemo(() => [
        {
            accessorKey: 'title', header: 'Title',
            cell: ({ row }) => (
                <Link href={`/admin/notifications/${row.original.id}`} className="font-semibold hover:text-bm-gold transition-colors">
                    {row.original.title}
                </Link>
            ),
        },
        {
            accessorKey: 'type', header: 'Type',
            cell: ({ row }) => {
                const cfg = notificationTypeConfig[row.original.type] || notificationTypeConfig.info;
                const Icon = cfg.icon;

                return <Badge variant="outline" className={`${cfg.color} rounded-lg text-xs font-bold flex items-center gap-1 w-fit`}><Icon className="size-3" />{cfg.label}</Badge>;
            },
        },
        {
            accessorKey: 'target', header: 'Target',
            cell: ({ row }) => <span className="text-sm capitalize">{row.original.target}</span>,
        },
        {
            accessorKey: 'status', header: 'Status',
            cell: ({ row }) => {
                const cfg = notificationStatusConfig[row.original.status] || notificationStatusConfig.draft;
                const Icon = cfg.icon;

                return <Badge variant="outline" className={`${cfg.color} rounded-lg text-xs font-bold flex items-center gap-1 w-fit`}><Icon className="size-3" />{cfg.label}</Badge>;
            },
        },
        {
            accessorKey: 'recipients_count', header: 'Recipients',
            cell: ({ row }) => <span className="font-mono text-sm">{row.original.recipients_count}</span>,
        },
        {
            accessorKey: 'created_at', header: 'Created',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{new Date(row.original.created_at).toLocaleDateString()}</span>,
        },
    ], []);

    const renderGridItem = (notif: Notif) => {
        const typeCfg = notificationTypeConfig[notif.type] || notificationTypeConfig.info;
        const statusCfg = notificationStatusConfig[notif.status] || notificationStatusConfig.draft;
        const TypeIcon = typeCfg.icon;

        return (
            <div className="group relative bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden hover:shadow-md transition-all h-full flex flex-col p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${typeCfg.color}`}>
                            <TypeIcon className="size-5" />
                        </div>
                        <div className="min-w-0 pr-2">
                            <Link href={`/admin/notifications/${notif.id}`} className="font-semibold text-base hover:text-bm-gold transition-colors line-clamp-2 relative z-10">
                                {notif.title}
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className={`${statusCfg.color} rounded-lg text-[10px] font-bold`}>
                        {statusCfg.label}
                    </Badge>
                    <Badge variant="secondary" className="rounded-lg text-[10px] font-bold capitalize">
                        {notif.target}
                    </Badge>
                </div>

                <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between text-sm border-t border-border/40 pt-3">
                        <span className="text-muted-foreground">Recipients</span>
                        <span className="font-mono font-medium">{notif.recipients_count}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Created: {new Date(notif.created_at).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="absolute inset-0 border-2 border-transparent group-hover:border-bm-gold/20 rounded-2xl pointer-events-none transition-colors" />
                <Link href={`/admin/notifications/${notif.id}`} className="absolute inset-0 z-1 opacity-0 bg-transparent text-[0px]">View Detail</Link>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Notifications', href: '#' }]}>
            <Head title="Notifications" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                    <Heading title="Notifications" description="Manage system and promotional notifications." />
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold rounded-xl gap-2"><Plus className="size-4" />New Notification</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg rounded-2xl">
                            <DialogHeader><DialogTitle className="text-lg font-black">Create Notification</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-2">
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground/80">Title</Label>
                                    <Input placeholder="Notification title..." className="rounded-xl" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                                    <InputError message={form.errors.title} className="text-xs" />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground/80">Message</Label>
                                    <Textarea placeholder="Notification message..." className="rounded-xl min-h-[100px]" value={form.data.message} onChange={(e) => form.setData('message', e.target.value)} />
                                    <InputError message={form.errors.message} className="text-xs" />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="grid gap-1.5">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground/80">Type</Label>
                                        <Select value={form.data.type} onValueChange={(v) => form.setData('type', v)}>
                                            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                {Object.entries(notificationTypeConfig).map(([k, v]) => <SelectItem key={k} value={k} className="rounded-xl">{v.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={form.errors.type} className="text-xs" />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground/80">Target</Label>
                                        <Select value={form.data.target} onValueChange={(v) => form.setData('target', v)}>
                                            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                <SelectItem value="all" className="rounded-xl">Everyone</SelectItem>
                                                <SelectItem value="admins" className="rounded-xl">Admins Only</SelectItem>
                                                <SelectItem value="clients" className="rounded-xl">Clients Only</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={form.errors.target} className="text-xs" />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground/80">Channel</Label>
                                        <Select value={form.data.channel} onValueChange={(v) => form.setData('channel', v)}>
                                            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                <SelectItem value="in_app" className="rounded-xl">In-App</SelectItem>
                                                <SelectItem value="email" className="rounded-xl">Email</SelectItem>
                                                <SelectItem value="both" className="rounded-xl">Both</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={form.errors.channel} className="text-xs" />
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end pt-2">
                                    <Button variant="outline" className="rounded-xl" onClick={() => handleSubmit(false)} disabled={form.processing}>
                                        {submitAction === 'draft' && form.processing ? 'Saving...' : 'Save Draft'}
                                    </Button>
                                    <Button className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold rounded-xl gap-2" onClick={() => handleSubmit(true)} disabled={form.processing}>
                                        <Send className="size-4" /> {submitAction === 'send' && form.processing ? 'Sending...' : 'Send Now'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input placeholder="Search notifications..." className="pl-9 rounded-xl border-border/40" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                    </div>
                    <Select value={filters.type || 'all'} onValueChange={(v) => handleFilter('type', v === 'all' ? undefined : v)}>
                        <SelectTrigger className="w-[140px] rounded-xl border-border/40"><Filter className="size-4 mr-2 text-muted-foreground" /><SelectValue placeholder="All Types" /></SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all" className="rounded-xl">All Types</SelectItem>
                            {Object.entries(notificationTypeConfig).map(([k, v]) => <SelectItem key={k} value={k} className="rounded-xl">{v.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={filters.status || 'all'} onValueChange={(v) => handleFilter('status', v === 'all' ? undefined : v)}>
                        <SelectTrigger className="w-[140px] rounded-xl border-border/40"><Filter className="size-4 mr-2 text-muted-foreground" /><SelectValue placeholder="All Status" /></SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all" className="rounded-xl">All Status</SelectItem>
                            {Object.entries(notificationStatusConfig).map(([k, v]) => <SelectItem key={k} value={k} className="rounded-xl">{v.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <DataTableWithPagination
                    columns={columns}
                    data={notifications.data}
                    pagination={notifications}
                    emptyMessage="No notifications yet."
                    onPageChange={(url) => router.get(url)}
                    renderGridItem={renderGridItem}
                />
            </div>
        </AppLayout>
    );
}
