import { Head, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    Megaphone,
    ExternalLink,
    ImagePlus,
    X,
    MoreVertical,
    Clock,
    Link,
    Image as ImageIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import AdvertisementController from '@/actions/App/Http/Controllers/Admin/AdvertisementController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

/* ─────────────────────────────────── Types ──────────────────────────────── */

interface Advertisement {
    id: number;
    title: string;
    content: string;
    image_path: string | null;
    link_url: string | null;
    is_active: boolean;
    priority: number;
    display_start_at: string | null;
    display_duration_hours: number | null;
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

/* ──────────────────────────────── Helpers ───────────────────────────────── */

function getPriorityMeta(priority: number) {
    if (priority >= 10) {
return { label: 'Top', cls: 'bg-bm-gold/20 text-bm-gold border-bm-gold/30' };
}

    if (priority >= 5) {
return { label: 'High', cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
}

    if (priority < 0) {
return { label: 'Low', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
}

    return { label: 'Normal', cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
}

function formatDateTime(iso: string | null) {
    if (!iso) {
return null;
}

    return new Date(iso).toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function toLocalDatetimeValue(iso: string | null): string {
    if (!iso) {
return '';
}

    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* ──────────────────────────────── Card ─────────────────────────────────── */

function AdCard({
    ad,
    onEdit,
    onDelete,
}: {
    ad: Advertisement;
    onEdit: (ad: Advertisement) => void;
    onDelete: (ad: Advertisement) => void;
}) {
    const { label, cls } = getPriorityMeta(ad.priority);

    return (
        <div className="group relative break-inside-avoid mb-4 rounded-2xl overflow-hidden bg-card border border-border/40 shadow-sm hover:shadow-lg hover:border-bm-gold/30 transition-all duration-300 cursor-pointer">
            {/* Image area */}
            {ad.image_path ? (
                <div className="relative w-full overflow-hidden">
                    <img
                        src={`/storage/${ad.image_path}`}
                        alt={ad.title}
                        className="w-full h-auto block object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                </div>
            ) : (
                <div className="w-full aspect-[4/3] flex flex-col items-center justify-center bg-muted/30">
                    <ImageIcon className="size-10 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground/40 mt-2">No image</p>
                </div>
            )}

            {/* Badges — always visible on top-left */}
            <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
                <Badge
                    variant="outline"
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 backdrop-blur-sm border ${cls}`}
                >
                    {label}
                </Badge>
                {!ad.is_active && (
                    <Badge
                        variant="outline"
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 backdrop-blur-sm bg-black/40 border-white/10 text-white/60"
                    >
                        Inactive
                    </Badge>
                )}
            </div>

            {/* 3-dot menu — top-right */}
            <div className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white border border-white/10 shadow-md"
                        >
                            <MoreVertical className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl">
                        <DropdownMenuItem
                            className="gap-2 rounded-lg cursor-pointer"
                            onClick={() => onEdit(ad)}
                        >
                            <Edit2 className="size-3.5" /> Edit
                        </DropdownMenuItem>
                        {ad.link_url && (
                            <DropdownMenuItem
                                className="gap-2 rounded-lg cursor-pointer"
                                onClick={() => window.open(ad.link_url!, '_blank')}
                            >
                                <ExternalLink className="size-3.5" /> Open Link
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="gap-2 rounded-lg cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
                            onClick={() => onDelete(ad)}
                        >
                            <Trash2 className="size-3.5" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Info footer */}
            <div className="p-3 space-y-1.5">
                <h3 className="font-bold text-sm leading-tight line-clamp-2">{ad.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{ad.content}</p>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {ad.link_url && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/60">
                            <Link className="size-2.5" />
                            <span className="truncate max-w-[100px]">{ad.link_url.replace(/^https?:\/\//, '')}</span>
                        </span>
                    )}
                    {ad.display_duration_hours && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/60">
                            <Clock className="size-2.5" />
                            {ad.display_duration_hours}h
                        </span>
                    )}
                </div>

                {ad.display_start_at && (
                    <p className="text-[10px] text-muted-foreground/50">
                        Starts: {formatDateTime(ad.display_start_at)}
                    </p>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────── Main Page ──────────────────────────────── */

export default function AdvertisementsIndex({ advertisements }: Props) {
    const [search, setSearch] = useState('');
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
        display_start_at: string;
        display_duration_hours: string;
        _method?: string;
    }>({
        title: '',
        content: '',
        image: null,
        image_path: '',
        link_url: '',
        is_active: true,
        priority: 0,
        display_start_at: '',
        display_duration_hours: '',
    });

    useEffect(() => {
        if (editingAd) {
            transform((d) => ({ ...d, _method: 'PUT' }));
        } else {
            transform((d) => ({ ...d, _method: undefined }));
        }
    }, [editingAd]);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Advertisements', href: '#' },
    ];

    /* ── Handlers ── */

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
            display_start_at: toLocalDatetimeValue(ad.display_start_at),
            display_duration_hours: ad.display_duration_hours?.toString() ?? '',
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
        const url = editingAd
            ? AdvertisementController.update.url(editingAd.id)
            : AdvertisementController.store.url();

        post(url, {
            forceFormData: true,
            onSuccess: () => {
                setIsModalOpen(false);
                Swal.fire(
                    editingAd ? 'Updated!' : 'Created!',
                    `Advertisement has been ${editingAd ? 'updated' : 'created'}.`,
                    'success'
                );
            },
        });
    };

    const handleDelete = (ad: Advertisement) => {
        Swal.fire({
            title: 'Delete this ad?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(AdvertisementController.destroy.url(ad.id), {
                    onSuccess: () => Swal.fire('Deleted!', 'Advertisement has been deleted.', 'success'),
                });
            }
        });
    };

    /* ── Filter ── */

    const filtered = advertisements.data.filter((ad) =>
        `${ad.title} ${ad.content}`.toLowerCase().includes(search.toLowerCase())
    );

    /* ──────────────────────────────────────────────────────────────────── */

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Advertisements" />

            <div className="space-y-6 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                {/* Header */}
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
                        New Ad
                    </Button>
                </div>

                {/* Search + Count */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search advertisements..."
                            className="pl-9 rounded-xl border-border/40"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <span className="text-sm text-muted-foreground">
                        {filtered.length} ad{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Empty state */}
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="p-5 rounded-3xl bg-bm-gold/10 text-bm-gold mb-4">
                            <Megaphone className="size-10" />
                        </div>
                        <h3 className="text-lg font-bold">No advertisements yet</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {search ? 'No results match your search.' : 'Click "New Ad" to create your first promotion.'}
                        </p>
                    </div>
                )}

                {/* Pinterest Masonry Grid */}
                {filtered.length > 0 && (
                    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
                        {filtered.map((ad) => (
                            <AdCard
                                key={ad.id}
                                ad={ad}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {advertisements.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        {advertisements.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                className={`rounded-lg min-w-[36px] ${link.active ? 'bg-bm-gold text-black hover:bg-bm-gold/90 border-none' : ''}`}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ─────────────── Create / Edit Modal ─────────────── */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-4xl rounded-3xl border-none bg-background/95 backdrop-blur-2xl p-0 overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)]">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col max-h-[92vh]">
                            {/* Header */}
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
                                            Configure your promotion. Active ads appear on the client dashboard.
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                                    {/* ── Left: Info ── */}
                                    <div className="space-y-5">
                                        {/* Title */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
                                                Title
                                            </Label>
                                            <Input
                                                id="title"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                className="h-12 rounded-xl border-border/40 bg-background/50 focus:border-bm-gold/50 text-base font-medium"
                                                placeholder="e.g. 20% Off Spring Maintenance"
                                                required
                                            />
                                            {errors.title && <p className="text-xs text-red-500 ml-1">{errors.title}</p>}
                                        </div>

                                        {/* Content */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="content" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
                                                Description
                                            </Label>
                                            <Textarea
                                                id="content"
                                                value={data.content}
                                                onChange={(e) => setData('content', e.target.value)}
                                                className="min-h-[130px] rounded-xl border-border/40 bg-background/50 focus:border-bm-gold/50 text-base leading-relaxed"
                                                placeholder="Describe your promotion..."
                                                required
                                            />
                                            {errors.content && <p className="text-xs text-red-500 ml-1">{errors.content}</p>}
                                        </div>

                                        {/* Priority + Active */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
                                                    Priority
                                                </Label>
                                                <Select
                                                    value={data.priority.toString()}
                                                    onValueChange={(v) => setData('priority', parseInt(v))}
                                                >
                                                    <SelectTrigger className="h-12 rounded-xl border-border/40 bg-background/50 focus:border-bm-gold/50">
                                                        <SelectValue placeholder="Set Priority" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl p-1">
                                                        <SelectItem value="10" className="rounded-xl focus:bg-bm-gold/10 focus:text-bm-gold font-bold py-3 px-4">Top (1st)</SelectItem>
                                                        <SelectItem value="5" className="rounded-xl focus:bg-bm-gold/10 focus:text-bm-gold py-3 px-4">High</SelectItem>
                                                        <SelectItem value="0" className="rounded-xl focus:bg-bm-gold/10 focus:text-bm-gold py-3 px-4">Normal</SelectItem>
                                                        <SelectItem value="-5" className="rounded-xl focus:bg-bm-gold/10 focus:text-bm-gold py-3 px-4">Low</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex flex-col justify-center gap-2 pl-2">
                                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                                                    Active
                                                </Label>
                                                <div className="flex items-center gap-3">
                                                    <Switch
                                                        id="is_active"
                                                        checked={data.is_active}
                                                        onCheckedChange={(c) => setData('is_active', c)}
                                                    />
                                                    <Label htmlFor="is_active" className="text-sm font-bold cursor-pointer">
                                                        {data.is_active ? 'Active' : 'Inactive'}
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Link URL */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="link_url" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
                                                Link URL (optional)
                                            </Label>
                                            <div className="relative">
                                                <ExternalLink className="absolute left-3.5 top-3.5 size-5 text-muted-foreground/40" />
                                                <Input
                                                    id="link_url"
                                                    value={data.link_url}
                                                    onChange={(e) => setData('link_url', e.target.value)}
                                                    className="h-12 pl-10 rounded-xl border-border/40 bg-background/50 focus:border-bm-gold/50"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            {errors.link_url && <p className="text-xs text-red-500 ml-1">{errors.link_url}</p>}
                                        </div>

                                        {/* Time scheduling */}
                                        <div className="p-4 rounded-2xl border border-border/40 bg-muted/20 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Clock className="size-4 text-bm-gold" />
                                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                                                    Time Appearance (optional)
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="display_start_at" className="text-xs text-muted-foreground/70">
                                                        Start At
                                                    </Label>
                                                    <Input
                                                        id="display_start_at"
                                                        type="datetime-local"
                                                        value={data.display_start_at}
                                                        onChange={(e) => setData('display_start_at', e.target.value)}
                                                        className="h-10 rounded-xl border-border/40 bg-background/50 focus:border-bm-gold/50 text-sm"
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="display_duration_hours" className="text-xs text-muted-foreground/70">
                                                        Duration (hours)
                                                    </Label>
                                                    <Input
                                                        id="display_duration_hours"
                                                        type="number"
                                                        min={1}
                                                        max={8760}
                                                        value={data.display_duration_hours}
                                                        onChange={(e) => setData('display_duration_hours', e.target.value)}
                                                        className="h-10 rounded-xl border-border/40 bg-background/50 focus:border-bm-gold/50 text-sm"
                                                        placeholder="e.g. 24"
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
                                                Leave blank to always display. Set a start time + duration to auto-expire the ad.
                                            </p>
                                        </div>
                                    </div>

                                    {/* ── Right: Image ── */}
                                    <div className="space-y-5">
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
                                                Promotional Image
                                            </Label>
                                            <div className="relative group">
                                                {(data.image || data.image_path) ? (
                                                    <div className="relative w-full overflow-hidden rounded-2xl border border-border/40 bg-muted shadow-inner">
                                                        <img
                                                            src={data.image ? URL.createObjectURL(data.image) : `/storage/${data.image_path}`}
                                                            alt="Preview"
                                                            className="w-full h-auto block max-h-[420px] object-contain transition-all duration-500"
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

                                                                    if (!data.image) {
setData('image_path', '');
}
                                                                }}
                                                            >
                                                                <X className="size-6" />
                                                            </Button>
                                                            <input
                                                                id="image-replace"
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];

                                                                    if (file) {
setData('image', file);
}
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
                                                            <p className="text-lg font-black text-foreground mb-1 tracking-tight">Upload Image</p>
                                                            <p className="text-sm text-muted-foreground/60 font-medium">Portrait or landscape — auto-fitted</p>
                                                        </div>
                                                        <input
                                                            id="image-upload"
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];

                                                                if (file) {
setData('image', file);
}
                                                            }}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                            {errors.image && <p className="text-xs text-red-500 ml-1">{errors.image}</p>}
                                        </div>

                                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Tip</p>
                                            <p className="text-xs text-muted-foreground/80 leading-relaxed">
                                                Both portrait and landscape images work — they auto-fill the Pinterest-style grid on the client dashboard.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <DialogFooter className="p-8 pt-4 border-t border-border/40 bg-background/80 backdrop-blur-md">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl">
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
