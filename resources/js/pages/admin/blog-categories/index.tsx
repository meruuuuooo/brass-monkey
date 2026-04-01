import { Head, router, useForm } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    FolderTree,
    Layers,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { DataTableWithPagination } from '@/components/data-table';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from '@/layouts/app-layout';

interface BlogCategory {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    posts_count: number;
    created_at: string;
}

interface PaginatedCategories {
    data: BlogCategory[];
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
}

export default function BlogCategoriesIndex({ categories }: Props) {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);

    const { data, setData, post, processing, errors, reset, transform } = useForm<{
        name: string;
        slug: string;
        description: string;
        _method?: string;
    }>({
        name: '',
        slug: '',
        description: '',
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
        { title: 'Blog Content', href: '/admin/blog-posts' },
        { title: 'Categories', href: '#' },
    ];

    const filteredData = useMemo(() => {
        if (!search) {
return categories.data;
}

        const q = search.toLowerCase();

        return categories.data.filter((cat) =>
            cat.name.toLowerCase().includes(q) ||
            cat.slug.toLowerCase().includes(q)
        );
    }, [categories.data, search]);

    const columns: ColumnDef<BlogCategory>[] = useMemo(
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
                accessorKey: 'posts_count',
                header: 'Posts',
                cell: ({ row }) => (
                    <div className="font-mono text-sm">{row.original.posts_count}</div>
                ),
            },
            {
                id: 'actions',
                cell: ({ row }) => (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 cursor-pointer h-8 w-8 p-0"
                            onClick={() => handleEdit(row.original)}
                        >
                            <Edit2 className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 cursor-pointer h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
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

    const handleEdit = (category: BlogCategory) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            slug: category.slug || '',
            description: category.description || '',
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
            post(`/admin/blog-categories/${editingCategory.id}`, {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    Swal.fire('Updated!', 'Category has been updated.', 'success');
                },
            });
        } else {
            post('/admin/blog-categories', {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    Swal.fire('Created!', 'Category has been created.', 'success');
                },
            });
        }
    };

    const handleDelete = (category: BlogCategory) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Delete "${category.name}"? Blog posts in this category will lose the association.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/blog-categories/${category.id}`, {
                    onSuccess: () => {
                        Swal.fire('Deleted!', 'Category has been deleted.', 'success');
                    },
                });
            }
        });
    };

    const renderGridItem = (category: BlogCategory) => (
        <div className="group relative bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden hover:shadow-md transition-all h-full flex flex-col p-5">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-bm-gold/10 flex items-center justify-center shrink-0">
                        <Layers className="size-5 text-bm-gold" />
                    </div>
                    <div className="min-w-0 pr-2">
                        <h3 className="font-semibold text-lg truncate">{category.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{category.slug}</p>
                    </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex">
                    <Button variant="ghost" size="icon" className="size-8 cursor-pointer hover:bg-muted relative z-10 rounded-full" onClick={() => handleEdit(category)}>
                        <Edit2 className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 cursor-pointer text-red-500 hover:bg-red-50 relative z-10 rounded-full" onClick={() => handleDelete(category)}>
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <p className="text-sm text-foreground line-clamp-2 mb-4 h-10">
                    {category.description || <span className="text-muted-foreground italic">No description</span>}
                </p>
                <div className="mt-auto">
                    <div className="flex items-center justify-between text-sm pt-3 border-t border-border/40">
                        <span className="text-muted-foreground">Posts in Category</span>
                        <span className="font-mono font-bold bg-bm-gold/10 text-bm-gold px-2 py-0.5 rounded-md">{category.posts_count}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Blog Categories" />

            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Blog Categories"
                        description="Organize your blog posts into categories."
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
                    emptyMessage="No blog categories found. Create your first category!"
                    onPageChange={(url) => router.get(url)}
                    renderGridItem={renderGridItem}
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
                                            {editingCategory ? 'Update category details.' : 'Add a new blog category.'}
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
                                        placeholder="e.g. Repair Tips"
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-red-500 font-medium ml-1">{errors.name}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="slug" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Slug (Optional)</Label>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('slug', e.target.value)}
                                        className="h-12 rounded-xl border-border/40 bg-background/50 focus:border-bm-gold/50 focus:ring-bm-gold/20 text-base font-medium"
                                        placeholder="e.g. repair-tips"
                                    />
                                    {errors.slug && <p className="text-xs text-red-500 font-medium ml-1">{errors.slug}</p>}
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
