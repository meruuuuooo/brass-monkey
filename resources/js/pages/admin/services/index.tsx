import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    Plus,
    Pencil,
    Trash2,
    Wrench,
    Clock,
    DollarSign,
    CheckCircle2,
    XCircle,
    MoreVertical,
    Search,
    ImagePlus,
    X
} from 'lucide-react';

import admin from '@/routes/admin';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { BreadcrumbItem } from '@/types';

interface Service {
    id: number;
    name: string;
    description: string | null;
    duration: string | null;
    price: string;
    image_path: string | null;
    is_active: boolean;
    created_at: string;
}

interface Props {
    services: Service[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Services Management', href: '/admin/services' },
];

export default function ServicesIndex({ services }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, delete: destroy, processing, reset, errors } = useForm<{
        name: string;
        description: string;
        duration: string;
        price: string;
        image: File | null;
        image_path: string;
        is_active: boolean;
        _method?: string;
    }>({
        name: '',
        description: '',
        duration: '',
        price: '',
        image: null,
        image_path: '',
        is_active: true,
    });

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingService) {
            post(admin.services.update(editingService.id).url, {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingService(null);
                    reset();
                },
                onBefore: () => {
                    data._method = 'PUT';
                }
            });
        } else {
            post(admin.services.store().url, {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this service?')) {
            destroy(admin.services.destroy(id).url);
        }
    };

    const openEditModal = (service: Service) => {
        setEditingService(service);
        setData({
            name: service.name,
            description: service.description ?? '',
            duration: service.duration ?? '',
            price: service.price,
            image: null,
            image_path: service.image_path ?? '',
            is_active: service.is_active,
            _method: 'PUT',
        });
        setIsModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services Management" />

            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Services Management</h1>
                        <p className="text-muted-foreground">Manage the service offerings available to your clients.</p>
                    </div>
                    <Button onClick={() => { setEditingService(null); reset(); setIsModalOpen(true); }} className="bg-bm-gold hover:bg-bm-gold/90 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Add Service
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search services..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Card className="border-sidebar-border/50 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[300px]">Service Name</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredServices.length > 0 ? (
                                filteredServices.map((service) => (
                                    <TableRow key={service.id} className="hover:bg-muted/20 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bm-gold/10 text-bm-gold">
                                                    <Wrench className="h-5 w-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span>{service.name}</span>
                                                    <span className="text-xs text-muted-foreground line-clamp-1">{service.description}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-muted-foreground">
                                                <Clock className="mr-1.5 h-3.5 w-3.5" />
                                                {service.duration || 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center font-semibold text-bm-gold">
                                                <DollarSign className="mr-0.5 h-3.5 w-3.5" />
                                                {service.price}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {service.is_active ? (
                                                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 gap-1 font-medium">
                                                    <CheckCircle2 className="h-3 w-3" /> Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200 gap-1 font-medium">
                                                    <XCircle className="h-3 w-3" /> Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-full">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 rounded-xl border-border/50">
                                                    <DropdownMenuItem onClick={() => openEditModal(service)} className="cursor-pointer">
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(service.id)} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground italic">
                                        No services found. Try adjusting your search or add a new service.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-4xl rounded-3xl border-none bg-background/95 backdrop-blur-2xl p-0 overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)]">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col h-full max-h-[90vh]">
                            <DialogHeader className="p-8 pb-4 border-b border-border/40">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-bm-gold/10 text-bm-gold">
                                        <Wrench className="size-6" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-3xl font-black tracking-tight">
                                            {editingService ? 'Edit Service' : 'New Service'}
                                        </DialogTitle>
                                        <DialogDescription className="text-sm font-medium text-muted-foreground/70">
                                            {editingService ? `Update the details for "${editingService.name}".` : 'Create a new service offering for your clients.'}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left Column: Info */}
                                    <div className="space-y-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Service Name</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                placeholder="e.g. Machine Repair"
                                                className={`h-12 rounded-xl border-border/40 bg-background/50 focus:border-bm-gold/50 focus:ring-bm-gold/20 text-base font-medium ${errors.name ? 'border-red-500 ring-red-500' : ''}`}
                                                required
                                            />
                                            {errors.name && <p className="text-xs font-medium text-red-500 ml-1">{errors.name}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="duration" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Duration (Optional)</Label>
                                                <Input
                                                    id="duration"
                                                    value={data.duration}
                                                    onChange={e => setData('duration', e.target.value)}
                                                    placeholder="e.g. 2 hr"
                                                    className="h-12 rounded-xl border-border/40 bg-background/50 focus:border-bm-gold/50 focus:ring-bm-gold/20"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="price" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Price ($)</Label>
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    step="0.01"
                                                    value={data.price}
                                                    onChange={e => setData('price', e.target.value)}
                                                    placeholder="0.00"
                                                    className={`h-12 rounded-xl border-border/40 bg-background/50 focus:border-bm-gold/50 focus:ring-bm-gold/20 ${errors.price ? 'border-red-500 ring-red-500' : ''}`}
                                                    required
                                                />
                                                {errors.price && <p className="text-xs font-medium text-red-500 ml-1">{errors.price}</p>}
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={e => setData('description', e.target.value)}
                                                placeholder="Describe the service details..."
                                                className="min-h-[160px] rounded-xl border-border/40 bg-background/50 focus:border-bm-gold/50 focus:ring-bm-gold/20 text-base leading-relaxed"
                                                rows={4}
                                            />
                                            {errors.description && <p className="text-xs font-medium text-red-500 ml-1">{errors.description}</p>}
                                        </div>

                                        <div className="flex flex-col gap-3 justify-center pl-1">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Visibility Status</Label>
                                            <div className="flex items-center gap-3">
                                                <Switch
                                                    id="is_active"
                                                    checked={data.is_active}
                                                    onCheckedChange={checked => setData('is_active', checked)}
                                                />
                                                <Label htmlFor="is_active" className="text-sm font-bold cursor-pointer">
                                                    {data.is_active ? 'Currently Active' : 'Inactive'}
                                                </Label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Visuals */}
                                    <div className="space-y-6">
                                        <div className="grid gap-4">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Service Photo</Label>

                                            {(data.image || data.image_path) ? (
                                                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/40 bg-muted/30 group shadow-inner">
                                                    <img
                                                        src={data.image ? URL.createObjectURL(data.image) : `/storage/${data.image_path}`}
                                                        alt="Preview"
                                                        className="h-full w-full object-cover transition-all duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                        <label htmlFor="image-upload-field" className="cursor-pointer p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors text-white shadow-xl">
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
                                                            id="image-upload-field"
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) setData('image', file);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <label
                                                    htmlFor="image-upload-empty"
                                                    className="flex flex-col items-center justify-center aspect-video w-full rounded-2xl border-2 border-dashed border-border/40 bg-background/50 hover:bg-bm-gold/5 hover:border-bm-gold/30 transition-all cursor-pointer group shadow-inner"
                                                >
                                                    <div className="flex flex-col items-center justify-center text-center p-6">
                                                        <div className="p-4 rounded-3xl bg-bm-gold/10 text-bm-gold mb-4 group-hover:scale-110 transition-transform duration-300">
                                                            <ImagePlus className="size-8" />
                                                        </div>
                                                        <p className="text-lg font-black text-foreground mb-1 tracking-tight">Upload Service Photo</p>
                                                        <p className="text-sm text-muted-foreground/60 font-medium uppercase tracking-wider">PNG, JPG up to 2MB</p>
                                                    </div>
                                                    <input
                                                        id="image-upload-empty"
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) setData('image', file);
                                                        }}
                                                    />
                                                </label>
                                            )}
                                            {errors.image && <p className="text-xs font-medium text-red-500 ml-1">{errors.image}</p>}
                                        </div>

                                        <div className="p-5 rounded-2xl bg-muted/30 border border-border/40">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Display Tip</p>
                                            <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">
                                                A high-quality photo of your service in action helps clients understand what they are booking. Landscape orientation (16:9) works best.
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
                                    disabled={processing}
                                    className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold px-8 rounded-xl shadow-lg shadow-bm-gold/20"
                                >
                                    {processing ? 'Processing...' : (editingService ? 'Save Changes' : 'Create Service')}
                                </Button>
                            </DialogFooter>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
