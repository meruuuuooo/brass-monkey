import { Head, router, useForm } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Plus, Edit2, Trash2, Tag, Users, MoreVertical,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { DataTableWithPagination } from '@/components/data-table';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from '@/layouts/app-layout';

interface Segment {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    color: string;
    customers_count: number;
    created_at: string;
}

interface PaginatedSegments {
    data: Segment[];
    current_page: number; last_page: number; per_page: number; total: number;
    prev_page_url: string | null; next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props { segments: PaginatedSegments; }

const COLOR_OPTIONS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b'];

export default function CustomerSegmentsIndex({ segments }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<Segment | null>(null);

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        name: '',
        description: '',
        color: '#6366f1',
        _method: undefined as string | undefined,
    });

    useEffect(() => {
        transform((d) => ({ ...d, _method: editing ? 'PUT' : undefined }));
    }, [editing]);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Customer Segments', href: '#' },
    ];

    const columns: ColumnDef<Segment>[] = useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Segment',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <span className="size-4 rounded-full shrink-0" style={{ backgroundColor: row.original.color }} />
                    <div>
                        <div className="font-semibold">{row.original.name}</div>
                        {row.original.description && <div className="text-xs text-muted-foreground line-clamp-1">{row.original.description}</div>}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'customers_count',
            header: 'Customers',
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-sm">
                    <Users className="size-3.5 text-muted-foreground" />
                    <span className="font-mono">{row.original.customers_count}</span>
                </div>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="size-8 h-8 w-8 p-0 cursor-pointer">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleEdit(row.original)}
                            >
                                <Edit2 className="mr-2 size-4" />
                                Edit Segment
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer text-red-500 focus:text-red-500"
                                onClick={() => handleDelete(row.original)}
                            >
                                <Trash2 className="mr-2 size-4" />
                                Delete Segment
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ], []);

    const renderGridItem = (seg: Segment) => (
        <div className="group relative bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden hover:shadow-md transition-all h-full flex flex-col p-5">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ backgroundColor: `${seg.color}20` }}>
                        <Tag className="size-5" style={{ color: seg.color }} />
                    </div>
                    <div className="min-w-0 pr-2">
                        <h3 className="font-semibold text-lg truncate">{seg.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{seg.slug}</p>
                    </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 rounded-full hover:bg-muted cursor-pointer relative z-10">
                                <MoreVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl z-50">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleEdit(seg)}>
                                <Edit2 className="mr-2 size-4" /> Edit Segment
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500" onClick={() => handleDelete(seg)}>
                                <Trash2 className="mr-2 size-4" /> Delete Segment
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <p className="text-sm text-foreground line-clamp-2 mb-4 h-10">
                    {seg.description || <span className="text-muted-foreground italic">No description</span>}
                </p>
                <div className="mt-auto pt-3 border-t border-border/40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Users className="size-4" />
                            <span>Customers</span>
                        </div>
                        <Badge variant="secondary" className="font-mono text-sm rounded-lg" style={{ backgroundColor: `${seg.color}20`, color: seg.color }}>
                            {seg.customers_count}
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    );

    const handleEdit = (seg: Segment) => {
        setEditing(seg);
        setData({ name: seg.name, description: seg.description || '', color: seg.color, _method: 'PUT' });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
 setEditing(null); reset(); setIsModalOpen(true); 
};

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editing ? `/admin/customer-segments/${editing.id}` : '/admin/customer-segments';
        post(url, {
            forceFormData: true,
            onSuccess: () => {
                setIsModalOpen(false);
                Swal.fire(editing ? 'Updated!' : 'Created!', `Segment ${editing ? 'updated' : 'created'}.`, 'success');
            },
        });
    };

    const handleDelete = (seg: Segment) => {
        Swal.fire({
            title: 'Delete segment?', text: `"${seg.name}" — ${seg.customers_count} customers will be unlinked.`,
            icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Delete',
        }).then((r) => {
            if (r.isConfirmed) {
router.delete(`/admin/customer-segments/${seg.id}`, {
                onSuccess: () => Swal.fire('Deleted!', 'Segment removed.', 'success'),
            });
}
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Segments" />
            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading title="Customer Segments" description="Group customers for targeted marketing and analytics." />
                    <Button className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold rounded-xl gap-2" onClick={handleCreate}>
                        <Plus className="size-4" /> New Segment
                    </Button>
                </div>
                <DataTableWithPagination
                    columns={columns}
                    data={segments.data}
                    pagination={segments}
                    emptyMessage="No segments yet."
                    onPageChange={(url) => router.get(url)}
                    renderGridItem={renderGridItem}
                />
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl border-none bg-background/95 backdrop-blur-2xl p-0 overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)]">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col h-full max-h-[90vh]">
                            <DialogHeader className="p-8 pb-4 border-b border-border/40">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-bm-gold/10 text-bm-gold"><Tag className="size-6" /></div>
                                    <div>
                                        <DialogTitle className="text-2xl font-black tracking-tight">{editing ? 'Edit Segment' : 'New Segment'}</DialogTitle>
                                        <DialogDescription className="text-sm font-medium text-muted-foreground/70">Define a customer group.</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto p-8 space-y-5">
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Name *</Label>
                                    <Input value={data.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)} className="h-12 rounded-xl border-border/40 bg-background/50" placeholder="e.g. VIP Customers" required />
                                    {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Description</Label>
                                    <Textarea value={data.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)} className="min-h-[60px] rounded-xl border-border/40 bg-background/50" placeholder="Optional..." />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Color</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {COLOR_OPTIONS.map((c) => (
                                            <button key={c} type="button" className={`size-8 rounded-xl border-2 transition-all ${data.color === c ? 'border-foreground scale-110 shadow-md' : 'border-transparent'}`} style={{ backgroundColor: c }} onClick={() => setData('color', c)} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="p-8 pt-4 border-t border-border/40 bg-background/80 backdrop-blur-md">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl">Cancel</Button>
                                <Button type="submit" className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold px-8 rounded-xl shadow-lg shadow-bm-gold/20" disabled={processing}>
                                    {editing ? 'Save Changes' : 'Create Segment'}
                                </Button>
                            </DialogFooter>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
