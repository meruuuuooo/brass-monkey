import { Head, router, useForm } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Truck, Phone, Mail, MoreVertical,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from '@/layouts/app-layout';

interface Supplier {
    id: number;
    name: string;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    is_active: boolean;
    purchase_orders_count: number;
    created_at: string;
}

interface PaginatedSuppliers {
    data: Supplier[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    suppliers: PaginatedSuppliers;
}

export default function SuppliersIndex({ suppliers }: Props) {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<Supplier | null>(null);

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        name: '',
        contact_name: '',
        email: '',
        phone: '',
        address: '',
        is_active: true,
        _method: undefined as string | undefined,
    });

    useEffect(() => {
        transform((d) => ({ ...d, _method: editing ? 'PUT' : undefined }));
    }, [editing]);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Suppliers', href: '#' },
    ];

    const filteredData = useMemo(() => {
        if (!search) {
return suppliers.data;
}

        const q = search.toLowerCase();

        return suppliers.data.filter((s) =>
            s.name.toLowerCase().includes(q) ||
            s.contact_name?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q)
        );
    }, [suppliers.data, search]);

    const columns: ColumnDef<Supplier>[] = useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Supplier',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-bm-gold/10 flex items-center justify-center">
                        <Truck className="size-4 text-bm-gold" />
                    </div>
                    <div>
                        <div className="font-semibold">{row.original.name}</div>
                        {row.original.contact_name && (
                            <div className="text-xs text-muted-foreground">{row.original.contact_name}</div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'email',
            header: 'Contact',
            cell: ({ row }) => (
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    {row.original.email && (
                        <span className="flex items-center gap-1"><Mail className="size-3" />{row.original.email}</span>
                    )}
                    {row.original.phone && (
                        <span className="flex items-center gap-1"><Phone className="size-3" />{row.original.phone}</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'purchase_orders_count',
            header: 'Orders',
            cell: ({ row }) => <div className="font-mono text-sm">{row.original.purchase_orders_count}</div>,
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => row.original.is_active ? (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 flex items-center gap-1 w-fit">
                    <CheckCircle2 className="size-3" /> Active
                </Badge>
            ) : (
                <Badge variant="outline" className="bg-muted text-muted-foreground flex items-center gap-1 w-fit">
                    <XCircle className="size-3" /> Inactive
                </Badge>
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
                                Edit Supplier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer text-red-500 focus:text-red-500"
                                onClick={() => handleDelete(row.original)}
                            >
                                <Trash2 className="mr-2 size-4" />
                                Delete Supplier
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ], []);

    const handleEdit = (s: Supplier) => {
        setEditing(s);
        setData({
            name: s.name,
            contact_name: s.contact_name || '',
            email: s.email || '',
            phone: s.phone || '',
            address: s.address || '',
            is_active: s.is_active,
            _method: 'PUT',
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
 setEditing(null); reset(); setIsModalOpen(true); 
};

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editing ? `/admin/suppliers/${editing.id}` : '/admin/suppliers';
        post(url, {
            forceFormData: true,
            onSuccess: () => {
                setIsModalOpen(false);
                Swal.fire(editing ? 'Updated!' : 'Created!', `Supplier has been ${editing ? 'updated' : 'created'}.`, 'success');
            },
        });
    };

    const handleDelete = (s: Supplier) => {
        Swal.fire({
            title: 'Are you sure?', text: `Delete "${s.name}"?`, icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Yes, delete it!',
        }).then((r) => {
            if (r.isConfirmed) {
router.delete(`/admin/suppliers/${s.id}`, {
                onSuccess: () => Swal.fire('Deleted!', 'Supplier removed.', 'success'),
            });
}
        });
    };

    const renderGridItem = (s: Supplier) => (
        <div className="group relative bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden hover:shadow-md transition-all h-full flex flex-col p-5">
            <div className="flex items-center gap-4 mb-4">
                <div className="size-12 rounded-xl bg-bm-gold/10 flex items-center justify-center shrink-0">
                    <Truck className="size-6 text-bm-gold" />
                </div>
                <div className="flex-1 min-w-0 pr-8">
                    <h3 className="font-semibold text-lg truncate">{s.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{s.contact_name || 'No contact person'}</p>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 rounded-full hover:bg-muted cursor-pointer relative z-10">
                                <MoreVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl z-50">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleEdit(s)}>
                                <Edit2 className="mr-2 size-4" /> Edit Supplier
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500" onClick={() => handleDelete(s)}>
                                <Trash2 className="mr-2 size-4" /> Delete Supplier
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="mt-auto space-y-3">
                <div className="flex items-center justify-between text-sm border-t border-border/40 pt-3">
                    <span className="text-muted-foreground">Orders</span>
                    <span className="font-mono font-medium">{s.purchase_orders_count}</span>
                </div>
                <div className="flex flex-col gap-1 text-sm pt-2">
                    {s.email && <span className="flex items-center gap-2 text-muted-foreground truncate"><Mail className="size-3 shrink-0" /> {s.email}</span>}
                    {s.phone && <span className="flex items-center gap-2 text-muted-foreground truncate"><Phone className="size-3 shrink-0" /> {s.phone}</span>}
                </div>
                <div className="pt-2">
                    {s.is_active ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="size-3" /> Active
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground flex items-center gap-1 w-fit">
                            <XCircle className="size-3" /> Inactive
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Suppliers" />
            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading title="Suppliers" description="Manage your supplier directory." />
                    <Button className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold rounded-xl gap-2" onClick={handleCreate}>
                        <Plus className="size-4" /> New Supplier
                    </Button>
                </div>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input placeholder="Search suppliers..." className="pl-9 rounded-xl border-border/40" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <DataTableWithPagination
                    columns={columns}
                    data={filteredData}
                    pagination={suppliers}
                    emptyMessage="No suppliers found."
                    onPageChange={(url) => router.get(url)}
                    renderGridItem={renderGridItem}
                />
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-lg rounded-3xl border-none bg-background/95 backdrop-blur-2xl p-0 overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)]">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col h-full max-h-[90vh]">
                            <DialogHeader className="p-8 pb-4 border-b border-border/40">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-bm-gold/10 text-bm-gold"><Truck className="size-6" /></div>
                                    <div>
                                        <DialogTitle className="text-2xl font-black tracking-tight">{editing ? 'Edit Supplier' : 'New Supplier'}</DialogTitle>
                                        <DialogDescription className="text-sm font-medium text-muted-foreground/70">Supplier contact and address details.</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto p-8 space-y-5">
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Company Name *</Label>
                                    <Input value={data.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)} className="h-12 rounded-xl border-border/40 bg-background/50" placeholder="Acme Parts Co." required />
                                    {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Contact Person</Label>
                                    <Input value={data.contact_name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('contact_name', e.target.value)} className="h-12 rounded-xl border-border/40 bg-background/50" placeholder="John Smith" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Email</Label>
                                        <Input type="email" value={data.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('email', e.target.value)} className="h-12 rounded-xl border-border/40 bg-background/50" placeholder="john@acme.com" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Phone</Label>
                                        <Input value={data.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('phone', e.target.value)} className="h-12 rounded-xl border-border/40 bg-background/50" placeholder="+63 917 xxx xxxx" />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Address</Label>
                                    <Textarea value={data.address} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('address', e.target.value)} className="min-h-[80px] rounded-xl border-border/40 bg-background/50" placeholder="Full address..." />
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/40">
                                    <Switch id="supplier-active" checked={data.is_active} onCheckedChange={(c: boolean) => setData('is_active', c)} />
                                    <Label htmlFor="supplier-active" className="text-sm font-bold cursor-pointer">{data.is_active ? 'Active' : 'Inactive'}</Label>
                                </div>
                            </div>
                            <DialogFooter className="p-8 pt-4 border-t border-border/40 bg-background/80 backdrop-blur-md">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl">Cancel</Button>
                                <Button type="submit" className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold px-8 rounded-xl shadow-lg shadow-bm-gold/20" disabled={processing}>
                                    {editing ? 'Save Changes' : 'Create Supplier'}
                                </Button>
                            </DialogFooter>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
