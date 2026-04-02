import { Head, router, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Search, Filter, Plus, User, UserCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { DataTableWithPagination } from '@/components/data-table';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { serviceRequestPriorityConfig, serviceRequestStatusConfig } from '@/lib/crm-config';

interface PaginatedJobs {
    data: any[]; current_page: number; last_page: number; per_page: number; total: number;
    prev_page_url: string | null; next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    requests: PaginatedJobs;
    filters: { status?: string; priority?: string; assigned_to?: string; search?: string };
    technicians: { id: number; name: string }[];
    services: { id: number; name: string }[];
}

export default function ServiceRequestsIndex({ requests, filters, technicians, services }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [open, setOpen] = useState(false);

    const form = useForm({
        service_id: '', customer_name: '', priority: 'normal', description: '', estimated_completion: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/service-requests', {
            onSuccess: () => {
                setOpen(false);
                form.reset();
                Swal.fire('Created!', 'Service job created.', 'success');
            },
        });
    };

    const handleFilter = (k: string, v: string | undefined) => {
        router.get('/admin/service-requests', { ...filters, [k]: v, page: 1 }, { preserveState: true });
    };
    const handleSearch = () => handleFilter('search', search || undefined);

    const columns: ColumnDef<any>[] = useMemo(() => [
        {
            accessorKey: 'tracking_number', header: 'Job ID',
            cell: ({ row }) => (
                <Link href={`/admin/service-requests/${row.original.id}`} className="font-semibold font-mono text-sm hover:text-bm-gold transition-colors">
                    {row.original.tracking_number}
                </Link>
            ),
        },
        {
            accessorKey: 'customer_name', header: 'Customer',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.customer_name}</div>
                    {row.original.customer?.email && <div className="text-xs text-muted-foreground">{row.original.customer.email}</div>}
                </div>
            ),
        },
        {
            accessorKey: 'service_type', header: 'Service',
            cell: ({ row }) => <span className="text-sm font-medium">{row.original.service?.name || row.original.service_type}</span>,
        },
        {
            accessorKey: 'status', header: 'Status',
            cell: ({ row }) => {
                const cfg = serviceRequestStatusConfig[row.original.status] || serviceRequestStatusConfig.pending;
                const Icon = cfg.icon;

                return <Badge variant="outline" className={`${cfg.color} rounded-lg text-xs font-bold flex items-center gap-1 w-fit`}><Icon className="size-3" />{cfg.label}</Badge>;
            },
        },
        {
            accessorKey: 'priority', header: 'Priority',
            cell: ({ row }) => {
                const cfg = serviceRequestPriorityConfig[row.original.priority] || serviceRequestPriorityConfig.normal;

                return <Badge variant="outline" className={`${cfg.color} rounded-lg text-xs font-bold w-fit`}>{cfg.label}</Badge>;
            },
        },
        {
            accessorKey: 'assignee', header: 'Assigned To',
            cell: ({ row }) => row.original.assignee ? (
                <div className="flex items-center gap-1.5 text-sm font-medium"><UserCircle2 className="size-4 text-muted-foreground" />{row.original.assignee.name}</div>
            ) : <span className="text-sm text-muted-foreground italic">Unassigned</span>,
        },
        {
            accessorKey: 'created_at', header: 'Created',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{new Date(row.original.created_at).toLocaleDateString()}</span>,
        },
    ], []);

    const renderGridItem = (req: any) => {
        const statusCfg = serviceRequestStatusConfig[req.status] || serviceRequestStatusConfig.pending;
        const priorityCfg = serviceRequestPriorityConfig[req.priority] || serviceRequestPriorityConfig.normal;
        const StatusIcon = statusCfg.icon;

        return (
            <div className="group relative bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden hover:shadow-md transition-all h-full flex flex-col p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="pr-4">
                        <Link href={`/admin/service-requests/${req.id}`} className="font-mono font-bold text-lg text-bm-gold hover:underline relative z-10 break-all">
                            {req.tracking_number}
                        </Link>
                        <div className="font-medium mt-1 truncate">{req.customer_name}</div>
                        {req.customer?.email && <div className="text-xs text-muted-foreground truncate">{req.customer.email}</div>}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge variant="outline" className={`${statusCfg.color} rounded-lg text-[10px] font-bold flex items-center gap-1`}>
                            <StatusIcon className="size-3" />{statusCfg.label}
                        </Badge>
                        <Badge variant="outline" className={`${priorityCfg.color} rounded-lg text-[10px] font-bold`}>
                            {priorityCfg.label}
                        </Badge>
                    </div>
                </div>

                <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between text-sm border-t border-border/40 pt-3">
                        <span className="text-muted-foreground">Service</span>
                        <span className="font-medium text-xs truncate max-w-[150px]">{req.service?.name || req.service_type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Assignee</span>
                        {req.assignee ? (
                            <div className="flex items-center gap-1.5 text-sm font-medium truncate max-w-[150px]">
                                <UserCircle2 className="size-4 shrink-0 text-muted-foreground" />
                                <span className="truncate">{req.assignee.name}</span>
                            </div>
                        ) : (
                            <span className="text-sm text-muted-foreground italic truncate">Unassigned</span>
                        )}
                    </div>
                    <div className="text-xs text-muted-foreground pt-1 flex justify-between">
                        <span>Created: {new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="absolute inset-0 border-2 border-transparent group-hover:border-bm-gold/20 rounded-2xl pointer-events-none transition-colors" />
                <Link href={`/admin/service-requests/${req.id}`} className="absolute inset-0 z-1 opacity-0 bg-transparent text-[0px]">View Job</Link>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Service Jobs', href: '#' }]}>
            <Head title="Service Jobs" />
            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                <div className="flex items-center justify-between">
                    <Heading title="Service Jobs" description="Manage repair requests, estimates, and service pipeline." />
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold rounded-xl gap-2"><Plus className="size-4" />New Service Job</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg rounded-2xl">
                            <form onSubmit={handleSubmit}>
                                <DialogHeader><DialogTitle className="text-lg font-black">Create Service Job</DialogTitle></DialogHeader>
                                <div className="space-y-4 pt-2">
                                    <div className="grid gap-1.5">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground/80">Customer Name</Label>
                                        <Input placeholder="Customer name..." className="rounded-xl" value={form.data.customer_name} onChange={(e) => form.setData('customer_name', e.target.value)} required />
                                        <InputError message={form.errors.customer_name} className="text-xs" />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground/80">Service Type</Label>
                                        <Select value={form.data.service_id} onValueChange={(v) => form.setData('service_id', v)} required>
                                            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select a service..." /></SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                {services.map(s => <SelectItem key={s.id} value={String(s.id)} className="rounded-xl">{s.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={form.errors.service_id} className="text-xs" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-1.5">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground/80">Priority</Label>
                                            <Select value={form.data.priority} onValueChange={(v) => form.setData('priority', v)}>
                                                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-2xl">
                                                    {Object.entries(serviceRequestPriorityConfig).map(([k, v]) => <SelectItem key={k} value={k} className="rounded-xl">{v.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={form.errors.priority} className="text-xs" />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground/80">Est. Completion</Label>
                                            <Input type="date" className="rounded-xl" value={form.data.estimated_completion} onChange={(e) => form.setData('estimated_completion', e.target.value)} />
                                            <InputError message={form.errors.estimated_completion} className="text-xs" />
                                        </div>
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground/80">Issue Description</Label>
                                        <Textarea placeholder="Describe the issue or service requested..." className="rounded-xl min-h-[100px]" value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                                        <InputError message={form.errors.description} className="text-xs" />
                                    </div>
                                    <div className="flex gap-2 justify-end pt-2">
                                        <Button type="button" variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
                                        <Button type="submit" className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold rounded-xl" disabled={form.processing}>{form.processing ? 'Creating...' : 'Create Job'}</Button>
                                    </div>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input placeholder="Search job ID or customer..." className="pl-9 rounded-xl border-border/40" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                    </div>
                    <Select value={filters.status || 'all'} onValueChange={(v) => handleFilter('status', v === 'all' ? undefined : v)}>
                        <SelectTrigger className="w-[140px] rounded-xl border-border/40"><Filter className="size-4 mr-2 text-muted-foreground" /><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all" className="rounded-xl">All Status</SelectItem>
                            {Object.entries(serviceRequestStatusConfig).map(([k, v]) => <SelectItem key={k} value={k} className="rounded-xl">{v.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={filters.priority || 'all'} onValueChange={(v) => handleFilter('priority', v === 'all' ? undefined : v)}>
                        <SelectTrigger className="w-[130px] rounded-xl border-border/40"><Filter className="size-4 mr-2 text-muted-foreground" /><SelectValue placeholder="Priority" /></SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all" className="rounded-xl">All Priorities</SelectItem>
                            {Object.entries(serviceRequestPriorityConfig).map(([k, v]) => <SelectItem key={k} value={k} className="rounded-xl">{v.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={filters.assigned_to || 'all'} onValueChange={(v) => handleFilter('assigned_to', v === 'all' ? undefined : v)}>
                        <SelectTrigger className="w-[160px] rounded-xl border-border/40"><User className="size-4 mr-2 text-muted-foreground" /><SelectValue placeholder="Assignee" /></SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all" className="rounded-xl">All Assignees</SelectItem>
                            <SelectItem value="unassigned" className="rounded-xl">Unassigned</SelectItem>
                            {technicians.map(t => <SelectItem key={t.id} value={String(t.id)} className="rounded-xl">{t.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <DataTableWithPagination
                    columns={columns}
                    data={requests.data}
                    pagination={requests}
                    emptyMessage="No service jobs found."
                    onPageChange={(url) => router.get(url)}
                    renderGridItem={renderGridItem}
                />
            </div>
        </AppLayout>
    );
}
