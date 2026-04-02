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
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
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

export default function ProductsIndex({
    products,
    categories,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const { data, setData, post, processing, errors, reset, transform } =
        useForm<{
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
                router.get(
                    '/admin/products',
                    { ...filters, search: search || undefined },
                    {
                        preserveState: true,
                        preserveScroll: true,
                    },
                );
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
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                    >
                        Product <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        {row.original.image_path ? (
                            <img
                                src={`/storage/${row.original.image_path}`}
                                alt={row.original.name}
                                className="size-10 rounded-lg border border-border/40 object-cover"
                            />
                        ) : (
                            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                                <Package className="size-4 text-muted-foreground" />
                            </div>
                        )}
                        <div>
                            <div className="font-semibold">
                                {row.original.name}
                            </div>
                            {row.original.sku && (
                                <div className="text-xs text-muted-foreground">
                                    SKU: {row.original.sku}
                                </div>
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
                    <Button
                        variant="ghost"
                        className="p-0 hover:bg-transparent"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                    >
                        Price <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="font-mono font-semibold">
                        $
                        {parseFloat(row.original.price).toLocaleString(
                            'en-US',
                            { minimumFractionDigits: 2 },
                        )}
                    </div>
                ),
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
                            className={`rounded-lg text-xs font-bold ${
                                qty === 0
                                    ? 'border-red-500/20 bg-red-500/10 text-red-500'
                                    : isLow
                                      ? 'border-amber-500/20 bg-amber-500/10 text-amber-600'
                                      : 'border-emerald-200 bg-emerald-50 text-emerald-600'
                            }`}
                        >
                            {qty === 0
                                ? 'Out of Stock'
                                : isLow
                                  ? `Low (${qty})`
                                  : qty}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: 'is_available',
                header: 'Status',
                cell: ({ row }) =>
                    row.original.is_available ? (
                        <Badge
                            variant="outline"
                            className="flex w-fit items-center gap-1 border-emerald-200 bg-emerald-50 text-emerald-600"
                        >
                            <CheckCircle2 className="size-3" /> Available
                        </Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className="flex w-fit items-center gap-1 bg-muted text-muted-foreground"
                        >
                            <XCircle className="size-3" /> Unavailable
                        </Badge>
                    ),
            },
            {
                id: 'actions',
                cell: ({ row }) => (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-8 h-8 w-8 cursor-pointer p-0"
                                >
                                    <span className="sr-only">Open menu</span>
                                    <MoreVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="rounded-xl"
                            >
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
        [],
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
                    Swal.fire(
                        'Updated!',
                        'Product has been updated.',
                        'success',
                    );
                },
            });
        } else {
            post('/admin/products', {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    Swal.fire(
                        'Created!',
                        'Product has been created.',
                        'success',
                    );
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
                        Swal.fire(
                            'Deleted!',
                            'Product has been deleted.',
                            'success',
                        );
                    },
                });
            }
        });
    };

    const handleFilter = (key: string, value: string | undefined) => {
        router.get(
            '/admin/products',
            {
                ...filters,
                [key]: value,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const renderGridItem = (product: Product) => (
        <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm transition-all hover:shadow-md">
            <div className="relative aspect-square bg-muted">
                {product.image_path ? (
                    <img
                        src={`/storage/${product.image_path}`}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground/30">
                        <Package className="mb-2 size-12" />
                        <span className="text-xs font-semibold">No Image</span>
                    </div>
                )}
                <div className="absolute top-2 right-2 flex flex-wrap justify-end gap-1">
                    {!product.is_available && (
                        <Badge
                            variant="secondary"
                            className="rounded-lg border-0! bg-background/90 text-foreground shadow-sm backdrop-blur-sm"
                        >
                            <XCircle className="mr-1 size-3" /> Unavailable
                        </Badge>
                    )}
                    {product.stock_quantity <= product.low_stock_threshold && (
                        <Badge
                            variant="destructive"
                            className="rounded-lg border-0! bg-red-500/90 text-white shadow-sm backdrop-blur-sm"
                        >
                            {product.stock_quantity === 0
                                ? 'Out of Stock'
                                : `Low: ${product.stock_quantity}`}
                        </Badge>
                    )}
                </div>

                <div className="absolute top-2 left-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="size-8 cursor-pointer rounded-full bg-background/90 shadow-sm backdrop-blur-sm hover:bg-background"
                            >
                                <MoreVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            className="rounded-xl"
                        >
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(product);
                                }}
                                className="cursor-pointer"
                            >
                                <Edit2 className="mr-2 size-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(product);
                                }}
                                className="cursor-pointer text-red-500 focus:text-red-500"
                            >
                                <Trash2 className="mr-2 size-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="flex flex-1 flex-col p-4">
                <div className="mb-1 flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-base font-semibold">
                        {product.name}
                    </h3>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2 text-sm">
                    <span className="text-muted-foreground">
                        {product.category?.name || 'Uncategorized'}
                    </span>
                    <span className="font-mono text-base font-bold text-bm-gold">
                        ₱
                        {parseFloat(product.price).toLocaleString('en-PH', {
                            minimumFractionDigits: 2,
                        })}
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Products" />

            <div className="m-4 mt-0 space-y-6 rounded-sm border border-sidebar-border/50 p-4 shadow-sm md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Products"
                        description="Manage your product catalog, pricing, and availability."
                    />
                    <Button
                        className="cursor-pointer gap-2 rounded-xl bg-bm-gold font-bold text-black hover:bg-bm-gold/90"
                        onClick={handleCreate}
                    >
                        <Plus className="size-4" />
                        New Product
                    </Button>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search products by name, SKU, or barcode..."
                            className="rounded-xl border-border/40 pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select
                        value={filters.category || 'all'}
                        onValueChange={(val) =>
                            handleFilter(
                                'category',
                                val === 'all' ? undefined : val,
                            )
                        }
                    >
                        <SelectTrigger className="w-[180px] rounded-xl border-border/40">
                            <Filter className="mr-2 size-4 text-muted-foreground" />
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all" className="rounded-xl">
                                All Categories
                            </SelectItem>
                            {categories.map((cat) => (
                                <SelectItem
                                    key={cat.id}
                                    value={cat.id.toString()}
                                    className="rounded-xl"
                                >
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.availability || 'all'}
                        onValueChange={(val) =>
                            handleFilter(
                                'availability',
                                val === 'all' ? undefined : val,
                            )
                        }
                    >
                        <SelectTrigger className="w-[160px] rounded-xl border-border/40">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all" className="rounded-xl">
                                All Status
                            </SelectItem>
                            <SelectItem
                                value="available"
                                className="rounded-xl"
                            >
                                Available
                            </SelectItem>
                            <SelectItem
                                value="unavailable"
                                className="rounded-xl"
                            >
                                Unavailable
                            </SelectItem>
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
                <DialogContent className="overflow-hidden rounded-3xl border-none bg-background/95 p-0 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:max-w-4xl">
                    <form onSubmit={handleSubmit}>
                        <div className="flex h-full max-h-[90vh] flex-col">
                            <DialogHeader className="border-b border-border/40 p-8 pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-2xl bg-bm-gold/10 p-3 text-bm-gold">
                                        <Package className="size-6" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-3xl font-black tracking-tight">
                                            {editingProduct
                                                ? 'Edit Product'
                                                : 'New Product'}
                                        </DialogTitle>
                                        <DialogDescription className="text-sm font-medium text-muted-foreground/70">
                                            Fill in the product details below.
                                            Fields marked with * are required.
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                                    {/* Left Column: Info */}
                                    <div className="space-y-5">
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="name"
                                                className="ml-1 text-xs font-bold tracking-widest text-muted-foreground/80 uppercase"
                                            >
                                                Product Name *
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(
                                                    e: React.ChangeEvent<HTMLInputElement>,
                                                ) =>
                                                    setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-12 rounded-xl border-border/40 bg-background/50 text-base font-medium focus:border-bm-gold/50 focus:ring-bm-gold/20"
                                                placeholder="e.g. Custom Brake Pad Set"
                                                required
                                            />
                                            {errors.name && (
                                                <p className="ml-1 text-xs font-medium text-red-500">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="description"
                                                className="ml-1 text-xs font-bold tracking-widest text-muted-foreground/80 uppercase"
                                            >
                                                Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(
                                                    e: React.ChangeEvent<HTMLTextAreaElement>,
                                                ) =>
                                                    setData(
                                                        'description',
                                                        e.target.value,
                                                    )
                                                }
                                                className="min-h-[100px] rounded-xl border-border/40 bg-background/50 focus:border-bm-gold/50 focus:ring-bm-gold/20"
                                                placeholder="Describe the product..."
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="category_id"
                                                className="ml-1 text-xs font-bold tracking-widest text-muted-foreground/80 uppercase"
                                            >
                                                Category
                                            </Label>
                                            <Select
                                                value={data.category_id}
                                                onValueChange={(val) =>
                                                    setData('category_id', val)
                                                }
                                            >
                                                <SelectTrigger className="h-12 rounded-xl border-border/40 bg-background/50">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl">
                                                    {categories.map((cat) => (
                                                        <SelectItem
                                                            key={cat.id}
                                                            value={cat.id.toString()}
                                                            className="rounded-xl"
                                                        >
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor="sku"
                                                    className="ml-1 text-xs font-bold tracking-widest text-muted-foreground/80 uppercase"
                                                >
                                                    SKU
                                                </Label>
                                                <Input
                                                    id="sku"
                                                    value={data.sku}
                                                    onChange={(
                                                        e: React.ChangeEvent<HTMLInputElement>,
                                                    ) =>
                                                        setData(
                                                            'sku',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-12 rounded-xl border-border/40 bg-background/50"
                                                    placeholder="BRK-001"
                                                />
                                                {errors.sku && (
                                                    <p className="ml-1 text-xs font-medium text-red-500">
                                                        {errors.sku}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor="barcode"
                                                    className="ml-1 text-xs font-bold tracking-widest text-muted-foreground/80 uppercase"
                                                >
                                                    Barcode
                                                </Label>
                                                <Input
                                                    id="barcode"
                                                    value={data.barcode}
                                                    onChange={(
                                                        e: React.ChangeEvent<HTMLInputElement>,
                                                    ) =>
                                                        setData(
                                                            'barcode',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-12 rounded-xl border-border/40 bg-background/50"
                                                    placeholder="4901234567890"
                                                />
                                                {errors.barcode && (
                                                    <p className="ml-1 text-xs font-medium text-red-500">
                                                        {errors.barcode}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Pricing, Stock, Image */}
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor="price"
                                                    className="ml-1 text-xs font-bold tracking-widest text-muted-foreground/80 uppercase"
                                                >
                                                    Selling Price *
                                                </Label>
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.price}
                                                    onChange={(
                                                        e: React.ChangeEvent<HTMLInputElement>,
                                                    ) =>
                                                        setData(
                                                            'price',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-12 rounded-xl border-border/40 bg-background/50 font-mono"
                                                    placeholder="0.00"
                                                    required
                                                />
                                                {errors.price && (
                                                    <p className="ml-1 text-xs font-medium text-red-500">
                                                        {errors.price}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor="cost_price"
                                                    className="ml-1 text-xs font-bold tracking-widest text-muted-foreground/80 uppercase"
                                                >
                                                    Cost Price
                                                </Label>
                                                <Input
                                                    id="cost_price"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.cost_price}
                                                    onChange={(
                                                        e: React.ChangeEvent<HTMLInputElement>,
                                                    ) =>
                                                        setData(
                                                            'cost_price',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-12 rounded-xl border-border/40 bg-background/50 font-mono"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor="stock_quantity"
                                                    className="ml-1 text-xs font-bold tracking-widest text-muted-foreground/80 uppercase"
                                                >
                                                    Stock Quantity
                                                </Label>
                                                <Input
                                                    id="stock_quantity"
                                                    type="number"
                                                    min="0"
                                                    value={data.stock_quantity}
                                                    onChange={(
                                                        e: React.ChangeEvent<HTMLInputElement>,
                                                    ) =>
                                                        setData(
                                                            'stock_quantity',
                                                            parseInt(
                                                                e.target.value,
                                                            ) || 0,
                                                        )
                                                    }
                                                    className="h-12 rounded-xl border-border/40 bg-background/50 font-mono"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor="low_stock_threshold"
                                                    className="ml-1 text-xs font-bold tracking-widest text-muted-foreground/80 uppercase"
                                                >
                                                    Low Stock Alert
                                                </Label>
                                                <Input
                                                    id="low_stock_threshold"
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        data.low_stock_threshold
                                                    }
                                                    onChange={(
                                                        e: React.ChangeEvent<HTMLInputElement>,
                                                    ) =>
                                                        setData(
                                                            'low_stock_threshold',
                                                            parseInt(
                                                                e.target.value,
                                                            ) || 0,
                                                        )
                                                    }
                                                    className="h-12 rounded-xl border-border/40 bg-background/50 font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-muted/30 p-4">
                                            <Switch
                                                id="is_available"
                                                checked={data.is_available}
                                                onCheckedChange={(
                                                    checked: boolean,
                                                ) =>
                                                    setData(
                                                        'is_available',
                                                        checked,
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor="is_available"
                                                className="cursor-pointer text-sm font-bold"
                                            >
                                                {data.is_available
                                                    ? 'Available for Sale'
                                                    : 'Unavailable'}
                                            </Label>
                                        </div>

                                        {/* Image Upload */}
                                        <div className="grid gap-2">
                                            <Label className="ml-1 text-xs font-bold tracking-widest text-muted-foreground/80 uppercase">
                                                Product Photo
                                            </Label>
                                            <div className="group relative">
                                                {data.image ||
                                                data.image_path ? (
                                                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/40 bg-muted shadow-inner">
                                                        <img
                                                            src={
                                                                data.image
                                                                    ? URL.createObjectURL(
                                                                          data.image,
                                                                      )
                                                                    : `/storage/${data.image_path}`
                                                            }
                                                            alt="Preview"
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                            <label
                                                                htmlFor="product-image-replace"
                                                                className="cursor-pointer rounded-full bg-white/20 p-3 text-white shadow-xl backdrop-blur-md transition-colors hover:bg-white/40"
                                                            >
                                                                <ImagePlus className="size-6" />
                                                            </label>
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="icon"
                                                                className="size-12 rounded-full shadow-xl"
                                                                onClick={() => {
                                                                    setData(
                                                                        'image',
                                                                        null,
                                                                    );

                                                                    if (
                                                                        !data.image
                                                                    ) {
                                                                        setData(
                                                                            'image_path',
                                                                            '',
                                                                        );
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
                                                                onChange={(
                                                                    e: React.ChangeEvent<HTMLInputElement>,
                                                                ) => {
                                                                    const file =
                                                                        e.target
                                                                            .files?.[0];

                                                                    if (file) {
                                                                        setData(
                                                                            'image',
                                                                            file,
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <label
                                                        htmlFor="product-image-upload"
                                                        className="group flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/40 bg-background/50 shadow-inner transition-all hover:border-bm-gold/30 hover:bg-bm-gold/5"
                                                    >
                                                        <div className="flex flex-col items-center justify-center p-6 text-center">
                                                            <div className="mb-4 rounded-3xl bg-bm-gold/10 p-4 text-bm-gold transition-all duration-300 group-hover:scale-110">
                                                                <ImagePlus className="size-8" />
                                                            </div>
                                                            <p className="mb-1 text-lg font-black tracking-tight text-foreground">
                                                                Upload Photo
                                                            </p>
                                                            <p className="text-sm font-medium text-muted-foreground/60">
                                                                Recommended: 800
                                                                x 600px
                                                            </p>
                                                        </div>
                                                        <input
                                                            id="product-image-upload"
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(
                                                                e: React.ChangeEvent<HTMLInputElement>,
                                                            ) => {
                                                                const file =
                                                                    e.target
                                                                        .files?.[0];

                                                                if (file) {
                                                                    setData(
                                                                        'image',
                                                                        file,
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                            {errors.image && (
                                                <p className="ml-1 text-xs font-medium text-red-500">
                                                    {errors.image}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="border-t border-border/40 bg-background/80 p-8 pt-4 backdrop-blur-md">
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
                                    className="rounded-xl bg-bm-gold px-8 font-bold text-black shadow-lg shadow-bm-gold/20 hover:bg-bm-gold/90"
                                    disabled={processing}
                                >
                                    {editingProduct
                                        ? 'Save Changes'
                                        : 'Create Product'}
                                </Button>
                            </DialogFooter>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
