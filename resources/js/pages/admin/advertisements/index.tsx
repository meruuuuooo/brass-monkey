import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { 
    Plus, 
    Search, 
    MoreHorizontal, 
    Edit2, 
    Trash2, 
    CheckCircle2, 
    XCircle,
    Megaphone,
    ArrowUpDown,
    ExternalLink,
    ImagePlus,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';
import { DataTableWithPagination } from '@/components/data-table';
import Swal from 'sweetalert2';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { useForm } from '@inertiajs/react';
import AdvertisementController from '@/actions/App/Http/Controllers/Admin/AdvertisementController';


interface Advertisement {
    id: number;
    title: string;
    content: string;
    image_path: string | null;
    link_url: string | null;
    is_active: boolean;
    priority: number;
    created_at: string;
}

interface PaginatedAdvertisements {
    data: Advertisement[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    advertisements: PaginatedAdvertisements;
}

export default function AdvertisementsIndex({ advertisements }: Props) {
    const [search, setSearch] = useState('');
    const [isMounted, setIsMounted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

    const { data, setData, post, processing, errors, reset, transform } = useForm<{
        title: string;
        content: string;
        image: File | null;
        image_path: string;
        link_url: string;
        is_active: boolean;
        priority: number;
        _method?: string;
    }>({
        title: '',
        content: '',
        image: null,
        image_path: '',
        link_url: '',
        is_active: true,
        priority: 0,
    });

    useEffect(() => {
        if (editingAd) {
            transform((data) => ({
                ...data,
                _method: 'PUT',
            }));
        } else {
            transform((data) => ({
                ...data,
                _method: undefined,
            }));
        }
    }, [editingAd]);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Advertisements', href: '#' },
    ];

    const columns: ColumnDef<Advertisement>[] = useMemo(
        () => [
            {
                accessorKey: 'title',
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Title <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => <div className="font-semibold">{row.getValue('title')}</div>,
            },
            {
                accessorKey: 'priority',
                header: ({ column }) => (
                    <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Priority <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const priority = row.original.priority;
                    let label = "Normal";
                    let color = "bg-slate-500/10 text-slate-500 border-slate-500/20";

                    if (priority >= 10) {
                        label = "Top";
                        color = "bg-bm-gold/10 text-bm-gold border-bm-gold/20";
                    } else if (priority >= 5) {
                        label = "High";
                        color = "bg-orange-500/10 text-orange-500 border-orange-500/20";
                    } else if (priority < 0) {
                        label = "Low";
                        color = "bg-blue-500/10 text-blue-500 border-blue-500/20";
                    }

                    return (
                        <Badge variant="outline" className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${color}`}>
                            {label}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: 'is_active',
                header: 'Status',
                cell: ({ row }) => (
                    row.original.is_active ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="size-3" /> Active
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground flex items-center gap-1 w-fit">
                            <XCircle className="size-3" /> Inactive
                        </Badge>
                    )
                ),
            },
            {
                accessorKey: 'priority',
                header: 'Priority',
                cell: ({ row }) => <div className="text-center">{row.getValue('priority')}</div>,
            },
            {
                accessorKey: 'created_at',
                header: 'Created At',
                cell: ({ row }) => <div>{new Date(row.original.created_at).toLocaleDateString()}</div>,
            },
            {
                id: 'actions',
                cell: ({ row }) => (
                    <div className="flex justify-end gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-8 h-8 w-8 p-0"
                            onClick={() => handleEdit(row.original)}
                        >
                            <Edit2 className="size-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-8 h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(row.original)}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                ),
            },
        ],
        []
    );

    const handleEdit = (ad: Advertisement) => {
        setEditingAd(ad);
        setData({
            title: ad.title,
            content: ad.content,
            image: null,
            image_path: ad.image_path || '',
            link_url: ad.link_url || '',
            is_active: ad.is_active,
            priority: ad.priority,
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingAd(null);
        reset();
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingAd) {
            post(AdvertisementController.update.url(editingAd.id), {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    Swal.fire('Updated!', 'Advertisement has been updated.', 'success');
                },
            });
        } else {
            post(AdvertisementController.store.url(), {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    Swal.fire('Created!', 'Advertisement has been created.', 'success');
                }
            });
        }
    };

    const handleDelete = (ad: Advertisement) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You won't be able to revert this!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(AdvertisementController.destroy.url(ad.id), {
                    onSuccess: () => {
                        Swal.fire('Deleted!', 'Advertisement has been deleted.', 'success');
                    }
                });
            }
        });
    };

    const renderGridItem = (ad: Advertisement) => (
        <Card className="h-full flex flex-col border-border/40 bg-background/50 transition-all hover:bg-bm-gold/5 hover:border-bm-gold/20">
            <CardContent className="p-5 flex flex-col h-full gap-4">
                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                        <h3 className="font-bold tracking-tight">{ad.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{ad.content}</p>
                    </div>
                    {ad.is_active ? (
                        <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                        <XCircle className="size-4 text-muted-foreground" />
                    )}
                </div>
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/40">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold">
                        Priority: {ad.priority}
                    </Badge>
                    <div className="flex gap-1">
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="size-8"
                            onClick={() => handleEdit(ad)}
                        >
                            <Edit2 className="size-3.5" />
                        </Button>
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="size-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(ad)}
                        >
                            <Trash2 className="size-3.5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Advertisements" />

            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading 
                        title="Advertisements" 
                        description="Create and manage promotions shown on the client dashboard."
                    />
                    <Button 
                        className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold rounded-xl gap-2"
                        onClick={handleCreate}
                    >
                        <Plus className="size-4" />
                        New Advertisement
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search advertisements..." 
                            className="pl-9 rounded-xl border-border/40"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <DataTableWithPagination
                    columns={columns}
                    data={advertisements.data}
                    pagination={advertisements}
                    emptyMessage="No advertisements found. Create your first promotion!"
                    onPageChange={(url) => router.get(url)}
                    renderGridItem={renderGridItem}
                />
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-4xl rounded-3xl border-none bg-background/95 backdrop-blur-2xl p-0 overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)]">
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col h-full max-h-[90vh]">
                        <DialogHeader className="p-8 pb-4 border-b border-border/40">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-bm-gold/10 text-bm-gold">
                                    <Megaphone className="size-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-3xl font-black tracking-tight">
                                        {editingAd ? 'Edit Advertisement' : 'New Advertisement'}
                                    </DialogTitle>
                                    <DialogDescription className="text-sm font-medium text-muted-foreground/70">
                                        Configure your promotion details. Active ads appear on the client dashboard.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column: Info */}
                                <div className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Advertisement Title</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('title', e.target.value)}
                                            className="h-12 rounded-xl border-border/40 bg-background/50 focus:border-bm-gold/50 focus:ring-bm-gold/20 text-base font-medium"
                                            placeholder="e.g. 20% Off Spring Maintenance"
                                            required
                                        />
                                        {errors.title && <p className="text-xs text-red-500 font-medium ml-1">{errors.title}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="content" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Content Description</Label>
                                        <Textarea
                                            id="content"
                                            value={data.content}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('content', e.target.value)}
                                            className="min-h-[160px] rounded-xl border-border/40 bg-background/50 focus:border-bm-gold/50 focus:ring-bm-gold/20 text-base leading-relaxed"
                                            placeholder="Describe your promotion or service in detail..."
                                            required
                                        />
                                        {errors.content && <p className="text-xs text-red-500 font-medium ml-1">{errors.content}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="priority" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Priority Order</Label>
                                            <Select 
                                                value={data.priority.toString()} 
                                                onValueChange={(val) => setData('priority', parseInt(val))}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl border-border/40 bg-background/50 focus:border-bm-gold/50 focus:ring-bm-gold/20">
                                                    <SelectValue placeholder="Set Priority" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl p-1">
                                                    <SelectItem value="10" className="rounded-xl focus:bg-bm-gold/10 focus:text-bm-gold font-bold py-3 px-4 transition-colors">Top Priority (1st)</SelectItem>
                                                    <SelectItem value="5" className="rounded-xl focus:bg-bm-gold/10 focus:text-bm-gold font-medium py-3 px-4 transition-colors">High Priority</SelectItem>
                                                    <SelectItem value="0" className="rounded-xl focus:bg-bm-gold/10 focus:text-bm-gold font-medium py-3 px-4 transition-colors">Normal Priority</SelectItem>
                                                    <SelectItem value="-5" className="rounded-xl focus:bg-bm-gold/10 focus:text-bm-gold font-medium py-3 px-4 transition-colors">Low Priority</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex flex-col gap-3 justify-center pl-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Visibility Status</Label>
                                            <div className="flex items-center gap-3">
                                                <Switch
                                                    id="is_active"
                                                    checked={data.is_active}
                                                    onCheckedChange={(checked: boolean) => setData('is_active', checked)}
                                                />
                                                <Label htmlFor="is_active" className="text-sm font-bold cursor-pointer">
                                                    {data.is_active ? 'Currently Active' : 'Inactive'}
                                                </Label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-2 pt-2">
                                        <Label htmlFor="link_url" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">External Link (Optional)</Label>
                                        <div className="relative">
                                            <Input
                                                id="link_url"
                                                value={data.link_url}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('link_url', e.target.value)}
                                                className="h-12 pl-10 rounded-xl border-border/40 bg-background/50 focus:border-bm-gold/50 focus:ring-bm-gold/20"
                                                placeholder="https://..."
                                            />
                                            <ExternalLink className="absolute left-3.5 top-3.5 size-5 text-muted-foreground/40" />
                                        </div>
                                        {errors.link_url && <p className="text-xs text-red-500 font-medium ml-1">{errors.link_url}</p>}
                                    </div>
                                </div>

                                {/* Right Column: Visuals */}
                                <div className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Promotional Photo</Label>
                                        <div className="relative group">
                                            {(data.image || data.image_path) ? (
                                                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/40 bg-muted shadow-inner">
                                                    <img 
                                                        src={data.image ? URL.createObjectURL(data.image) : `/storage/${data.image_path}`} 
                                                        alt="Preview" 
                                                        className="h-full w-full object-cover transition-all duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                        <label htmlFor="image-replace" className="cursor-pointer p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors text-white shadow-xl">
                                                            <ImagePlus className="size-6" />
                                                        </label>
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="size-12 rounded-full shadow-xl"
                                                            onClick={() => {
                                                                setData('image', null);
                                                                if (!data.image) setData('image_path', '');
                                                            }}
                                                        >
                                                            <X className="size-6" />
                                                        </Button>
                                                        <input 
                                                            id="image-replace" 
                                                            type="file" 
                                                            className="hidden" 
                                                            accept="image/*"
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) setData('image', file);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <label 
                                                    htmlFor="image-upload" 
                                                    className="flex flex-col items-center justify-center aspect-[4/3] w-full rounded-2xl border-2 border-dashed border-border/40 bg-background/50 hover:bg-bm-gold/5 hover:border-bm-gold/30 transition-all cursor-pointer shadow-inner group"
                                                >
                                                    <div className="flex flex-col items-center justify-center text-center p-6">
                                                        <div className="p-4 rounded-3xl bg-bm-gold/10 text-bm-gold mb-4 group-hover:scale-110 group-hover:bg-bm-gold/20 transition-all duration-300">
                                                            <ImagePlus className="size-8" />
                                                        </div>
                                                        <p className="text-lg font-black text-foreground mb-1 tracking-tight">Upload Ad Photo</p>
                                                        <p className="text-sm text-muted-foreground/60 font-medium">Recommended: 1200 x 900px</p>
                                                    </div>
                                                    <input 
                                                        id="image-upload" 
                                                        type="file" 
                                                        className="hidden" 
                                                        accept="image/*"
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) setData('image', file);
                                                        }}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        {errors.image && <p className="text-xs text-red-500 font-medium ml-1">{errors.image}</p>}
                                    </div>
                                    
                                    <div className="p-5 rounded-2xl bg-muted/30 border border-border/40">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Display Tip</p>
                                        <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">
                                            High-quality landscape photos work best for the dashboard carousel. Ensure your text content is concise to grab the client's attention.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-8 pt-4 border-t border-border/40 bg-background/80 backdrop-blur-md">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold px-8 rounded-xl shadow-lg shadow-bm-gold/20"
                                disabled={processing}
                            >
                                {editingAd ? 'Save Changes' : 'Create Advertisement'}
                            </Button>
                        </DialogFooter>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
        </AppLayout>
    );
}
