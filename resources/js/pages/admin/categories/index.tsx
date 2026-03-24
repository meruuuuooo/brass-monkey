import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    FolderTree,
    Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface ParentCategory {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    parent_id: number | null;
    parent: ParentCategory | null;
    is_active: boolean;
    products_count: number;
    created_at: string;
}

interface PaginatedCategories {
    data: Category[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    categories: PaginatedCategories;
    parentCategories: ParentCategory[];
}

export default function CategoriesIndex({ categories, parentCategories }: Props) {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const { data, setData, post, processing, errors, reset, transform } = useForm<{
        name: string;
        description: string;
        parent_id: string;
        is_active: boolean;
        _method?: string;
    }>({
        name: '',
        description: '',
        parent_id: '',
        is_active: true,
    });

    useEffect(() => {
        if (editingCategory) {
            transform((data) => ({ ...data, _method: 'PUT' }));
        } else {
            transform((data) => ({ ...data, _method: undefined }));
        }
    }, [editingCategory]);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Categories', href: '#' },
    ];

    const filteredData = useMemo(() => {
        if (!search) return categories.data;
        const q = search.toLowerCase();
        return categories.data.filter((cat) =>
            cat.name.toLowerCase().includes(q) ||
            cat.slug.toLowerCase().includes(q)
        );
    }, [categories.data, search]);

    const columns: ColumnDef<Category>[] = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'Category',
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-bm-gold/10 flex items-center justify-center">
                            <Layers className="size-4 text-bm-gold" />
                        </div>
                        <div>
                            <div className="font-semibold">{row.original.name}</div>
                            <div className="text-xs text-muted-foreground">{row.original.slug}</div>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'parent',
                header: 'Parent',
                cell: ({ row }) => (
                    row.original.parent ? (
                        <Badge variant="outline" className="rounded-lg text-xs">
                            {row.original.parent.name}
                        </Badge>
                    ) : (
                        <span className="text-xs text-muted-foreground">Root</span>
                    )
                ),
            },
            {
                accessorKey: 'products_count',
                header: 'Products',
                cell: ({ row }) => (
                    <div className="font-mono text-sm">{row.original.products_count}</div>
                ),
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

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            description: category.description || '',
            parent_id: category.parent_id?.toString() || '',
            is_active: category.is_active,
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingCategory(null);
        reset();
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCategory) {
            post(`/admin/categories/${editingCategory.id}`, {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    Swal.fire('Updated!', 'Category has been updated.', 'success');
                },
            });
        } else {
            post('/admin/categories', {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    Swal.fire('Created!', 'Category has been created.', 'success');
                },
            });
        }
    };

    const handleDelete = (category: Category) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Delete "${category.name}"? Products in this category will become uncategorized.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/categories/${category.id}`, {
                    onSuccess: () => {
                        Swal.fire('Deleted!', 'Category has been deleted.', 'success');
                    },
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Categories" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Categories"
                        description="Organize products into categories and subcategories."
                    />
                    <Button
                        className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold rounded-xl gap-2"
                        onClick={handleCreate}
                    >
                        <Plus className="size-4" />
                        New Category
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search categories..."
                            className="pl-9 rounded-xl border-border/40"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <DataTableWithPagination
                    columns={columns}
                    data={filteredData}
                    pagination={categories}
                    emptyMessage="No categories found. Create your first category!"
                    onPageChange={(url) => router.get(url)}
                />
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-lg rounded-3xl border-none bg-background/95 backdrop-blur-2xl p-0 overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)]">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col h-full max-h-[90vh]">
                            <DialogHeader className="p-8 pb-4 border-b border-border/40">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-bm-gold/10 text-bm-gold">
                                        <FolderTree className="size-6" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-2xl font-black tracking-tight">
                                            {editingCategory ? 'Edit Category' : 'New Category'}
                                        </DialogTitle>
                                        <DialogDescription className="text-sm font-medium text-muted-foreground/70">
                                            {editingCategory ? 'Update category details.' : 'Add a new product category.'}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-8 space-y-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Category Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                                        className="h-12 rounded-xl border-border/40 bg-background/50 focus:border-bm-gold/50 focus:ring-bm-gold/20 text-base font-medium"
                                        placeholder="e.g. Brake Systems"
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
                                        className="min-h-[80px] rounded-xl border-border/40 bg-background/50 focus:border-bm-gold/50 focus:ring-bm-gold/20"
                                        placeholder="Brief category description..."
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="parent_id" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Parent Category</Label>
                                    <Select value={data.parent_id || 'none'} onValueChange={(val) => setData('parent_id', val === 'none' ? '' : val)}>
                                        <SelectTrigger className="h-12 rounded-xl border-border/40 bg-background/50">
                                            <SelectValue placeholder="None (root category)" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            <SelectItem value="none" className="rounded-xl">None (root category)</SelectItem>
                                            {parentCategories
                                                .filter((c) => c.id !== editingCategory?.id)
                                                .map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-xl">
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/40">
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked: boolean) => setData('is_active', checked)}
                                    />
                                    <Label htmlFor="is_active" className="text-sm font-bold cursor-pointer">
                                        {data.is_active ? 'Active' : 'Inactive'}
                                    </Label>
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
                                    {editingCategory ? 'Save Changes' : 'Create Category'}
                                </Button>
                            </DialogFooter>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
