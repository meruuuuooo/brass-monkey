import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface BlogTag {
    id: number;
    name: string;
    slug: string;
    posts_count: number;
    created_at: string;
}

interface PaginatedTags {
    data: BlogTag[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    tags: PaginatedTags;
}

export default function BlogTagsIndex({ tags }: Props) {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<BlogTag | null>(null);

    const { data, setData, post, processing, errors, reset, transform } = useForm<{
        name: string;
        slug: string;
        _method?: string;
    }>({
        name: '',
        slug: '',
    });

    useEffect(() => {
        if (editingTag) {
            transform((data) => ({ ...data, _method: 'PUT' }));
        } else {
            transform((data) => ({ ...data, _method: undefined }));
        }
    }, [editingTag]);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Blog Content', href: '/admin/blog-posts' },
        { title: 'Tags', href: '#' },
    ];

    const filteredData = useMemo(() => {
        if (!search) return tags.data;
        const q = search.toLowerCase();
        return tags.data.filter((t) =>
            t.name.toLowerCase().includes(q) ||
            t.slug.toLowerCase().includes(q)
        );
    }, [tags.data, search]);

    const columns: ColumnDef<BlogTag>[] = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'Tag',
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-bm-gold/10 flex items-center justify-center">
                            <Tag className="size-4 text-bm-gold" />
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

    const handleEdit = (tag: BlogTag) => {
        setEditingTag(tag);
        setData({
            name: tag.name,
            slug: tag.slug || '',
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingTag(null);
        reset();
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingTag) {
            post(`/admin/blog-tags/${editingTag.id}`, {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    Swal.fire('Updated!', 'Tag has been updated.', 'success');
                },
            });
        } else {
            post('/admin/blog-tags', {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    Swal.fire('Created!', 'Tag has been created.', 'success');
                },
            });
        }
    };

    const handleDelete = (tag: BlogTag) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Delete "${tag.name}"? Blog posts with this tag will lose the association.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/blog-tags/${tag.id}`, {
                    onSuccess: () => {
                        Swal.fire('Deleted!', 'Tag has been deleted.', 'success');
                    },
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Blog Tags" />

            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Blog Tags"
                        description="Manage tags for blog posts."
                    />
                    <Button
                        className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold rounded-xl gap-2"
                        onClick={handleCreate}
                    >
                        <Plus className="size-4" />
                        New Tag
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tags..."
                            className="pl-9 rounded-xl border-border/40"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <DataTableWithPagination
                    columns={columns}
                    data={filteredData}
                    pagination={tags}
                    emptyMessage="No blog tags found. Create your first tag!"
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
                                        <Tag className="size-6" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-2xl font-black tracking-tight">
                                            {editingTag ? 'Edit Tag' : 'New Tag'}
                                        </DialogTitle>
                                        <DialogDescription className="text-sm font-medium text-muted-foreground/70">
                                            {editingTag ? 'Update tag details.' : 'Add a new tag.'}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-8 space-y-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Tag Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                                        className="h-12 rounded-xl border-border/40 bg-background/50 focus:border-bm-gold/50 focus:ring-bm-gold/20 text-base font-medium"
                                        placeholder="e.g. Tips"
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
                                        placeholder="e.g. tips"
                                    />
                                    {errors.slug && <p className="text-xs text-red-500 font-medium ml-1">{errors.slug}</p>}
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
                                    {editingTag ? 'Save Changes' : 'Create Tag'}
                                </Button>
                            </DialogFooter>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
