import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
    Bell, Search, Filter, Plus, Send, Clock, XCircle, CheckCircle2, Info, AlertTriangle, Megaphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Heading from '@/components/heading';
import { DataTableWithPagination } from '@/components/data-table';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import Swal from 'sweetalert2';
import { Link } from '@inertiajs/react';

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

export default function NotificationsIndex({ notifications, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [open, setOpen] = useState(false);

    const form = useForm({
        title: '', message: '', type: 'info', target: 'all', channel: 'in_app', send_now: false,
    });

    const handleSubmit = (sendNow: boolean) => {
        form.setData('send_now', sendNow);
        form.post('/admin/notifications', {
            onSuccess: () => {
                setOpen(false);
                form.reset();
                Swal.fire('Done!', sendNow ? 'Notification sent!' : 'Saved as draft.', 'success');
            },
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
                const cfg = typeConfig[row.original.type] || typeConfig.info;
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
                const cfg = statusConfig[row.original.status] || statusConfig.draft;
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
                                    {form.errors.title && <p className="text-xs text-red-500">{form.errors.title}</p>}
                                </div>
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground/80">Message</Label>
                                    <Textarea placeholder="Notification message..." className="rounded-xl min-h-[100px]" value={form.data.message} onChange={(e) => form.setData('message', e.target.value)} />
                                    {form.errors.message && <p className="text-xs text-red-500">{form.errors.message}</p>}
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="grid gap-1.5">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground/80">Type</Label>
                                        <Select value={form.data.type} onValueChange={(v) => form.setData('type', v)}>
                                            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                {Object.entries(typeConfig).map(([k, v]) => <SelectItem key={k} value={k} className="rounded-xl">{v.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
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
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end pt-2">
                                    <Button variant="outline" className="rounded-xl" onClick={() => handleSubmit(false)} disabled={form.processing}>
                                        Save Draft
                                    </Button>
                                    <Button className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold rounded-xl gap-2" onClick={() => handleSubmit(true)} disabled={form.processing}>
                                        <Send className="size-4" /> Send Now
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
                            {Object.entries(typeConfig).map(([k, v]) => <SelectItem key={k} value={k} className="rounded-xl">{v.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={filters.status || 'all'} onValueChange={(v) => handleFilter('status', v === 'all' ? undefined : v)}>
                        <SelectTrigger className="w-[140px] rounded-xl border-border/40"><Filter className="size-4 mr-2 text-muted-foreground" /><SelectValue placeholder="All Status" /></SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all" className="rounded-xl">All Status</SelectItem>
                            {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k} className="rounded-xl">{v.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <DataTableWithPagination columns={columns} data={notifications.data} pagination={notifications} emptyMessage="No notifications yet." onPageChange={(url) => router.get(url)} />
            </div>
        </AppLayout>
    );
}
