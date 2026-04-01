import { Head, router, useForm } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    ArrowUpDown,
    ImagePlus,
    X,
    Package,
    Filter,
    MoreVertical,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { DataTableWithPagination } from '@/components/data-table';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from '@/layouts/app-layout';

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    sku: string | null;
    barcode: string | null;
    price: string;
    cost_price: string;
    stock_quantity: number;
    low_stock_threshold: number;
    image_path: string | null;
    is_available: boolean;
    category_id: number | null;
    category: Category | null;
    created_at: string;
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    products: PaginatedProducts;
    categories: Category[];
    filters: {
        search?: string;
        category?: string;
        availability?: string;
    };
}

export default function ProductsIndex({ products, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const { data, setData, post, processing, errors, reset, transform } = useForm<{
        name: string;
        description: string;
        category_id: string;
        sku: string;
        barcode: string;
        price: string;
        cost_price: string;
        stock_quantity: number;
        low_stock_threshold: number;
        image: File | null;
        image_path: string;
        is_available: boolean;
        _method?: string;
    }>({
        name: '',
        description: '',
        category_id: '',
        sku: '',
        barcode: '',
        price: '',
        cost_price: '',
        stock_quantity: 0,
        low_stock_threshold: 5,
        image: null,
        image_path: '',
        is_available: true,
    });

    useEffect(() => {
        if (editingProduct) {
            transform((data) => ({ ...data, _method: 'PUT' }));
        } else {
            transform((data) => ({ ...data, _method: undefined }));
        }
    }, [editingProduct]);

    // Debounced search
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get('/admin/products', { ...filters, search: search || undefined }, {
                    preserveState: true,
                    preserveScroll: true,
                });
            }
        }, 400);

        return () => clearTimeout(timeout);
    }, [search]);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Products', href: '#' },
    ];

    const columns: ColumnDef<Product>[] = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Product <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        {row.original.image_path ? (
                            <img
                                src={`/storage/${row.original.image_path}`}
                                alt={row.original.name}
                                className="size-10 rounded-lg object-cover border border-border/40"
                            />
                        ) : (
                            <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                                <Package className="size-4 text-muted-foreground" />
                            </div>
                        )}
                        <div>
                            <div className="font-semibold">{row.original.name}</div>
                            {row.original.sku && (
                                <div className="text-xs text-muted-foreground">SKU: {row.original.sku}</div>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'category',
                header: 'Category',
                cell: ({ row }) => (
                    <Badge variant="outline" className="rounded-lg text-xs">
                        {row.original.category?.name ?? 'Uncategorized'}
                    </Badge>
                ),
            },
            {
                accessorKey: 'price',
                header: ({ column }) => (
                    <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Price <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => <div className="font-mono font-semibold">₱{parseFloat(row.original.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>,
            },
            {
                accessorKey: 'stock_quantity',
                header: 'Stock',
                cell: ({ row }) => {
                    const qty = row.original.stock_quantity;
                    const threshold = row.original.low_stock_threshold;
                    const isLow = qty <= threshold;

                    return (
                        <Badge
                            variant="outline"
                            className={`rounded-lg text-xs font-bold ${qty === 0
                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                : isLow
                                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                }`}
                        >
                            {qty === 0 ? 'Out of Stock' : isLow ? `Low (${qty})` : qty}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: 'is_available',
                header: 'Status',
                cell: ({ row }) => (
                    row.original.is_available ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="size-3" /> Available
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground flex items-center gap-1 w-fit">
                            <XCircle className="size-3" /> Unavailable
                        </Badge>
                    )
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
                                    Edit Product
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-500 focus:text-red-500"
                                    onClick={() => handleDelete(row.original)}
                                >
                                    <Trash2 className="mr-2 size-4" />
                                    Delete Product
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
            },
        ],
        []
    );

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setData({
            name: product.name,
            description: product.description || '',
            category_id: product.category_id?.toString() || '',
            sku: product.sku || '',
            barcode: product.barcode || '',
            price: product.price,
            cost_price: product.cost_price,
            stock_quantity: product.stock_quantity,
            low_stock_threshold: product.low_stock_threshold,
            image: null,
            image_path: product.image_path || '',
            is_available: product.is_available,
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingProduct(null);
        reset();
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingProduct) {
            post(`/admin/products/${editingProduct.id}`, {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    Swal.fire('Updated!', 'Product has been updated.', 'success');
                },
            });
        } else {
            post('/admin/products', {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    Swal.fire('Created!', 'Product has been created.', 'success');
                },
            });
        }
    };

    const handleDelete = (product: Product) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Delete "${product.name}"? This cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/products/${product.id}`, {
                    onSuccess: () => {
                        Swal.fire('Deleted!', 'Product has been deleted.', 'success');
                    },
                });
            }
        });
    };

    const handleFilter = (key: string, value: string | undefined) => {
        router.get('/admin/products', {
            ...filters,
            [key]: value,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const renderGridItem = (product: Product) => (
        <div className="group relative bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden hover:shadow-md transition-all h-full flex flex-col">
            <div className="aspect-square bg-muted relative">
                {product.image_path ? (
                    <img
                        src={`/storage/${product.image_path}`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                        <Package className="size-12 mb-2" />
                        <span className="text-xs font-semibold">No Image</span>
                    </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 flex-wrap justify-end">
                    {!product.is_available && (
                        <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-foreground rounded-lg border-0! shadow-sm">
                            <XCircle className="size-3 mr-1" /> Unavailable
                        </Badge>
                    )}
                    {product.stock_quantity <= product.low_stock_threshold && (
                        <Badge variant="destructive" className="bg-red-500/90 backdrop-blur-sm text-white rounded-lg border-0! shadow-sm">
                            {product.stock_quantity === 0 ? 'Out of Stock' : `Low: ${product.stock_quantity}`}
                        </Badge>
                    )}
                </div>

                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="size-8 rounded-full bg-background/90 backdrop-blur-sm shadow-sm hover:bg-background cursor-pointer">
                                <MoreVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="rounded-xl">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => {
 e.stopPropagation(); handleEdit(product); 
}} className="cursor-pointer">
                                <Edit2 className="mr-2 size-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
 e.stopPropagation(); handleDelete(product); 
}} className="cursor-pointer text-red-500 focus:text-red-500">
                                <Trash2 className="mr-2 size-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-semibold text-base line-clamp-2">{product.name}</h3>
                </div>
                <div className="mt-auto pt-2 flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{product.category?.name || 'Uncategorized'}</span>
                    <span className="font-mono font-bold text-bm-gold text-base">₱{parseFloat(product.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Products" />

            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Products"
                        description="Manage your product catalog, pricing, and availability."
                    />
                    <Button
                        className="bg-bm-gold cursor-pointer hover:bg-bm-gold/90 text-black font-bold rounded-xl gap-2"
                        onClick={handleCreate}
                    >
                        <Plus className="size-4" />
                        New Product
                    </Button>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products by name, SKU, or barcode..."
                            className="pl-9 rounded-xl border-border/40"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select
                        value={filters.category || 'all'}
                        onValueChange={(val) => handleFilter('category', val === 'all' ? undefined : val)}
                    >
                        <SelectTrigger className="w-[180px] rounded-xl border-border/40">
                            <Filter className="size-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all" className="rounded-xl">All Categories</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-xl">
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.availability || 'all'}
                        onValueChange={(val) => handleFilter('availability', val === 'all' ? undefined : val)}
                    >
                        <SelectTrigger className="w-[160px] rounded-xl border-border/40">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all" className="rounded-xl">All Status</SelectItem>
                            <SelectItem value="available" className="rounded-xl">Available</SelectItem>
                            <SelectItem value="unavailable" className="rounded-xl">Unavailable</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <DataTableWithPagination
                    columns={columns}
                    data={products.data}
                    pagination={products}
                    emptyMessage="No products found. Add your first product!"
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
                                        <Package className="size-6" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-3xl font-black tracking-tight">
                                            {editingProduct ? 'Edit Product' : 'New Product'}
                                        </DialogTitle>
                                        <DialogDescription className="text-sm font-medium text-muted-foreground/70">
                                            Fill in the product details below. Fields marked with * are required.
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left Column: Info */}
                                    <div className="space-y-5">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Product Name *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                                                className="h-12 rounded-xl border-border/40 bg-background/50 focus:border-bm-gold/50 focus:ring-bm-gold/20 text-base font-medium"
                                                placeholder="e.g. Custom Brake Pad Set"
                                                required
                                            />
                                            {errors.name && <p className="text-xs text-red-500 font-medium ml-1">{errors.name}</p>}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                                className="min-h-[100px] rounded-xl border-border/40 bg-background/50 focus:border-bm-gold/50 focus:ring-bm-gold/20"
                                                placeholder="Describe the product..."
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="category_id" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Category</Label>
                                            <Select value={data.category_id} onValueChange={(val) => setData('category_id', val)}>
                                                <SelectTrigger className="h-12 rounded-xl border-border/40 bg-background/50">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl">
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-xl">
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="sku" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">SKU</Label>
                                                <Input
                                                    id="sku"
                                                    value={data.sku}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('sku', e.target.value)}
                                                    className="h-12 rounded-xl border-border/40 bg-background/50"
                                                    placeholder="BRK-001"
                                                />
                                                {errors.sku && <p className="text-xs text-red-500 font-medium ml-1">{errors.sku}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="barcode" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Barcode</Label>
                                                <Input
                                                    id="barcode"
                                                    value={data.barcode}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('barcode', e.target.value)}
                                                    className="h-12 rounded-xl border-border/40 bg-background/50"
                                                    placeholder="4901234567890"
                                                />
                                                {errors.barcode && <p className="text-xs text-red-500 font-medium ml-1">{errors.barcode}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Pricing, Stock, Image */}
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="price" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Selling Price *</Label>
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.price}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('price', e.target.value)}
                                                    className="h-12 rounded-xl border-border/40 bg-background/50 font-mono"
                                                    placeholder="0.00"
                                                    required
                                                />
                                                {errors.price && <p className="text-xs text-red-500 font-medium ml-1">{errors.price}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="cost_price" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Cost Price</Label>
                                                <Input
                                                    id="cost_price"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.cost_price}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('cost_price', e.target.value)}
                                                    className="h-12 rounded-xl border-border/40 bg-background/50 font-mono"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="stock_quantity" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Stock Quantity</Label>
                                                <Input
                                                    id="stock_quantity"
                                                    type="number"
                                                    min="0"
                                                    value={data.stock_quantity}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('stock_quantity', parseInt(e.target.value) || 0)}
                                                    className="h-12 rounded-xl border-border/40 bg-background/50 font-mono"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="low_stock_threshold" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Low Stock Alert</Label>
                                                <Input
                                                    id="low_stock_threshold"
                                                    type="number"
                                                    min="0"
                                                    value={data.low_stock_threshold}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('low_stock_threshold', parseInt(e.target.value) || 0)}
                                                    className="h-12 rounded-xl border-border/40 bg-background/50 font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/40">
                                            <Switch
                                                id="is_available"
                                                checked={data.is_available}
                                                onCheckedChange={(checked: boolean) => setData('is_available', checked)}
                                            />
                                            <Label htmlFor="is_available" className="text-sm font-bold cursor-pointer">
                                                {data.is_available ? 'Available for Sale' : 'Unavailable'}
                                            </Label>
                                        </div>

                                        {/* Image Upload */}
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Product Photo</Label>
                                            <div className="relative group">
                                                {(data.image || data.image_path) ? (
                                                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/40 bg-muted shadow-inner">
                                                        <img
                                                            src={data.image ? URL.createObjectURL(data.image) : `/storage/${data.image_path}`}
                                                            alt="Preview"
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                            <label htmlFor="product-image-replace" className="cursor-pointer p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors text-white shadow-xl">
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
                                                                id="product-image-replace"
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
                                                        htmlFor="product-image-upload"
                                                        className="flex flex-col items-center justify-center aspect-[4/3] w-full rounded-2xl border-2 border-dashed border-border/40 bg-background/50 hover:bg-bm-gold/5 hover:border-bm-gold/30 transition-all cursor-pointer shadow-inner group"
                                                    >
                                                        <div className="flex flex-col items-center justify-center text-center p-6">
                                                            <div className="p-4 rounded-3xl bg-bm-gold/10 text-bm-gold mb-4 group-hover:scale-110 transition-all duration-300">
                                                                <ImagePlus className="size-8" />
                                                            </div>
                                                            <p className="text-lg font-black text-foreground mb-1 tracking-tight">Upload Photo</p>
                                                            <p className="text-sm text-muted-foreground/60 font-medium">Recommended: 800 x 600px</p>
                                                        </div>
                                                        <input
                                                            id="product-image-upload"
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                const file = e.target.files?.[0];

                                                                if (file) {
setData('image', file);
}
                                                            }}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                            {errors.image && <p className="text-xs text-red-500 font-medium ml-1">{errors.image}</p>}
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
                                    {editingProduct ? 'Save Changes' : 'Create Product'}
                                </Button>
                            </DialogFooter>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
