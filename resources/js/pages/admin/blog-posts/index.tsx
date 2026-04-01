import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    FileText,
    Image as ImageIcon,
    Upload,
    Calendar,
    Globe,
    Globe2,
    Archive
} from 'lucide-react';
import { useEffect, useMemo, useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import Swal from 'sweetalert2';
import { DataTableWithPagination } from '@/components/data-table';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import 'react-quill-new/dist/quill.snow.css';
import { Checkbox } from "@/components/ui/checkbox";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    featured_image_path: string | null;
    status: 'draft' | 'published' | 'archived';
    is_featured: boolean;
    meta_title: string | null;
    meta_description: string | null;
    published_at: string | null;
    scheduled_at: string | null;
    view_count: number;
    created_at: string;
    author: { id: number; name: string };
    categories: { id: number; name: string }[];
    tags: { id: number; name: string }[];
}

interface Category {
    id: number;
    name: string;
}

interface Tag {
    id: number;
    name: string;
}

interface PaginatedPosts {
    data: BlogPost[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    posts: PaginatedPosts;
    categories: Category[];
    tags: Tag[];
    filters: {
        status?: string;
        category?: string;
        search?: string;
    };
}

export default function BlogPostsIndex({ posts, categories, tags, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');

    const quillModules = useMemo(() => ({
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote', 'code-block'],

            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

            ['link'],
            ['clean']                                         // remove formatting button
        ],
    }), []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset, transform } = useForm<{
        title: string;
        slug: string;
        excerpt: string;
        content: string;
        status: string;
        is_featured: boolean;
        meta_title: string;
        meta_description: string;
        scheduled_at: string;
        featured_image: File | null;
        categories: number[];
        tags: number[];
        _method?: string;
    }>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        status: 'draft',
        is_featured: false,
        meta_title: '',
        meta_description: '',
        scheduled_at: '',
        featured_image: null,
        categories: [],
        tags: [],
    });

    useEffect(() => {
        if (editingPost) {
            transform((data) => ({ ...data, _method: 'PUT' }));

            if (editingPost.featured_image_path) {
                setImagePreview(`/storage/${editingPost.featured_image_path}`);
            } else {
                setImagePreview(null);
            }
        } else {
            transform((data) => ({ ...data, _method: undefined }));
            setImagePreview(null);
        }
    }, [editingPost]);

    // Debounced search and filtering
    useEffect(() => {
        const timer = setTimeout(() => {
            const query: any = {};

            if (search) {
query.search = search;
}

            if (statusFilter !== 'all') {
query.status = statusFilter;
}

            if (categoryFilter !== 'all') {
query.category = categoryFilter;
}

            router.get('/admin/blog-posts', query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, statusFilter, categoryFilter]);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Blog Content', href: '/admin/blog-posts' },
        { title: 'Posts', href: '#' },
    ];

    const columns: ColumnDef<BlogPost>[] = useMemo(
        () => [
            {
                accessorKey: 'title',
                header: 'Title',
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        {row.original.featured_image_path ? (
                            <img
                                src={`/storage/${row.original.featured_image_path}`}
                                alt="Post thumbnail"
                                className="size-10 rounded-lg object-cover bg-muted"
                            />
                        ) : (
                            <div className="size-10 rounded-lg bg-bm-gold/10 flex items-center justify-center">
                                <FileText className="size-5 text-bm-gold" />
                            </div>
                        )}
                        <div>
                            <div className="font-semibold text-sm line-clamp-1 max-w-[200px]">{row.original.title}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{row.original.slug}</div>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'author.name',
                header: 'Author',
                cell: ({ row }) => (
                    <span className="text-sm font-medium">{row.original.author.name}</span>
                ),
            },
            {
                accessorKey: 'categories',
                header: 'Categories',
                cell: ({ row }) => (
                    <div className="flex flex-wrap gap-1">
                        {row.original.categories.slice(0, 2).map((c) => (
                            <Badge key={c.id} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                                {c.name}
                            </Badge>
                        ))}
                        {row.original.categories.length > 2 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                +{row.original.categories.length - 2}
                            </Badge>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => {
                    const status = row.original.status;

                    if (status === 'published') {
                        return (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 flex items-center justify-center w-24">
                                Published
                            </Badge>
                        );
                    } else if (status === 'archived') {
                        return (
                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 flex items-center justify-center w-24">
                                Archived
                            </Badge>
                        );
                    }

                    return (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 flex items-center justify-center w-24">
                            Draft
                        </Badge>
                    );
                },
            },
            {
                accessorKey: 'published_at',
                header: 'Published',
                cell: ({ row }) => (
                    <div className="text-xs text-muted-foreground">
                        {row.original.published_at
                            ? new Date(row.original.published_at).toLocaleDateString()
                            : '-'}
                    </div>
                ),
            },
            {
                id: 'actions',
                cell: ({ row }) => (
                    <div className="flex justify-end gap-1">
                        {row.original.status !== 'published' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                title="Publish Now"
                                className="size-8 p-0 cursor-pointer text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => handlePublish(row.original)}
                            >
                                <Globe2 className="size-4" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            title="Edit"
                            className="size-8 p-0 cursor-pointer"
                            onClick={() => handleEdit(row.original)}
                        >
                            <Edit2 className="size-4" />
                        </Button>
                        {row.original.status !== 'archived' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                title="Archive"
                                className="size-8 p-0 cursor-pointer text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                onClick={() => handleArchive(row.original)}
                            >
                                <Archive className="size-4" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            title="Delete"
                            className="size-8 p-0 cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50"
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

    const handleEdit = (post: BlogPost) => {
        setEditingPost(post);
        setData({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || '',
            content: post.content,
            status: post.status,
            is_featured: post.is_featured,
            meta_title: post.meta_title || '',
            meta_description: post.meta_description || '',
            scheduled_at: post.scheduled_at ? new Date(post.scheduled_at).toISOString().slice(0, 16) : '',
            featured_image: null,
            categories: post.categories.map(c => c.id),
            tags: post.tags.map(t => t.id),
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingPost(null);
        reset();
        setImagePreview(null);
        setIsModalOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setData('featured_image', file);
            const imageUrl = URL.createObjectURL(file);
            setImagePreview(imageUrl);
        }
    };

    const handleRemoveImage = () => {
        setData('featured_image', null);
        setImagePreview(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingPost) {
            post(`/admin/blog-posts/${editingPost.id}`, {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    Swal.fire('Updated!', 'Blog post has been updated.', 'success');
                },
            });
        } else {
            post('/admin/blog-posts', {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    Swal.fire('Created!', 'Blog post has been created.', 'success');
                },
            });
        }
    };

    const handleDelete = (postItem: BlogPost) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Delete "${postItem.title}" permanently?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/blog-posts/${postItem.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire('Deleted!', 'Blog post has been deleted.', 'success');
                    },
                });
            }
        });
    };

    const handlePublish = (postItem: BlogPost) => {
        Swal.fire({
            title: 'Publish Post?',
            text: `Make "${postItem.title}" public now?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Publish',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/admin/blog-posts/${postItem.id}/publish`, {}, { preserveScroll: true });
            }
        });
    };

    const handleArchive = (postItem: BlogPost) => {
        Swal.fire({
            title: 'Archive Post?',
            text: `Hide "${postItem.title}" from public view?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Archive',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/admin/blog-posts/${postItem.id}/archive`, {}, { preserveScroll: true });
            }
        });
    };

    const renderGridItem = (postItem: BlogPost) => (
        <div className="group relative bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden hover:shadow-md transition-all h-full flex flex-col">
            {postItem.featured_image_path ? (
                <div className="h-40 w-full overflow-hidden bg-muted relative shrink-0">
                    <img
                        src={`/storage/${postItem.featured_image_path}`}
                        alt="Post thumbnail"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                        <Badge variant="secondary" className="bg-background/90 backdrop-blur-md border-transparent font-medium py-0.5 px-2">
                            {postItem.categories[0]?.name || 'Uncategorized'}
                        </Badge>
                        {postItem.is_featured && (
                            <Badge className="bg-bm-gold text-black border-transparent font-bold hover:bg-bm-gold shadow-md">
                                Featured
                            </Badge>
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-40 w-full bg-bm-gold/5 flex items-center justify-center shrink-0 border-b border-border/40 relative">
                    <FileText className="size-10 text-bm-gold/40" />
                    <div className="absolute bottom-3 left-3 flex justify-between items-end right-3">
                        <Badge variant="secondary" className="bg-background/90 backdrop-blur-md border-transparent font-medium py-0.5 px-2">
                            {postItem.categories[0]?.name || 'Uncategorized'}
                        </Badge>
                        {postItem.is_featured && (
                            <Badge className="bg-bm-gold text-black border-transparent font-bold hover:bg-bm-gold shadow-md">
                                Featured
                            </Badge>
                        )}
                    </div>
                </div>
            )}

            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-lg line-clamp-2 leading-tight flex-1">{postItem.title}</h3>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5 font-medium">
                        <div className="size-5 rounded-full bg-muted flex items-center justify-center border border-border/50">
                            {postItem.author.name.charAt(0)}
                        </div>
                        {postItem.author.name}
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-border/40 space-y-3">
                    <div className="flex items-center justify-between">
                        {postItem.status === 'published' ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                                Published
                            </Badge>
                        ) : postItem.status === 'archived' ? (
                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                                Archived
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                                Draft
                            </Badge>
                        )}
                        <span className="text-xs font-mono text-muted-foreground">
                            {new Date(postItem.created_at).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 relative z-10 justify-end">
                        {postItem.status !== 'published' && (
                            <Button variant="ghost" size="icon" title="Publish" className="h-8 w-8 cursor-pointer text-emerald-600 hover:bg-emerald-50" onClick={() => handlePublish(postItem)}>
                                <Globe2 className="size-4" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" title="Edit" className="h-8 w-8 cursor-pointer" onClick={() => handleEdit(postItem)}>
                            <Edit2 className="size-4" />
                        </Button>
                        {postItem.status !== 'archived' && (
                            <Button variant="ghost" size="icon" title="Archive" className="h-8 w-8 cursor-pointer text-amber-600 hover:bg-amber-50" onClick={() => handleArchive(postItem)}>
                                <Archive className="size-4" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" title="Delete" className="h-8 w-8 cursor-pointer text-red-500 hover:bg-red-50" onClick={() => handleDelete(postItem)}>
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Blog Posts" />

            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Blog Posts"
                        description="Create and manage your blog articles, news, and repair tips."
                    />
                    <Button
                        className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold rounded-xl gap-2"
                        onClick={handleCreate}
                    >
                        <Plus className="size-4" />
                        Create Post
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search posts by title..."
                            className="pl-9 rounded-xl border-border/40"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-border/40">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Drafts</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full sm:w-[200px] rounded-xl border-border/40">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(c => (
                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DataTableWithPagination
                    columns={columns}
                    data={posts.data}
                    pagination={posts}
                    emptyMessage="No blog posts found. Write your first post!"
                    onPageChange={(url) => router.get(url)}
                    renderGridItem={renderGridItem}
                />
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-4xl max-w-[95vw] w-full rounded-3xl border-none bg-background/95 backdrop-blur-2xl p-0 overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)]">
                    <form onSubmit={handleSubmit} className="flex flex-col h-[90vh]">
                        <DialogHeader className="px-8 py-5 border-b border-border/40 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-bm-gold/10 text-bm-gold">
                                    <FileText className="size-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black tracking-tight">
                                        {editingPost ? 'Edit Blog Post' : 'New Blog Post'}
                                    </DialogTitle>
                                    <DialogDescription className="text-sm font-medium text-muted-foreground/70">
                                        {editingPost ? 'Update article details.' : 'Write a new article for your readers.'}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto px-8 py-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* MAIN CONTENT COLUMN */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Title *</Label>
                                        <Input
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="h-12 rounded-xl text-base font-medium"
                                            placeholder="Catchy article title"
                                            required
                                        />
                                        {errors.title && <p className="text-xs text-red-500 font-medium ml-1">{errors.title}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Excerpt</Label>
                                        <Textarea
                                            value={data.excerpt}
                                            onChange={(e) => setData('excerpt', e.target.value)}
                                            className="min-h-[80px] rounded-xl"
                                            placeholder="Short summary for the blog listing page..."
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1 flex justify-between">
                                            <span>Content *</span>
                                        </Label>
                                        <div className="bg-background rounded-xl overflow-hidden [&_.ql-toolbar]:border-border/40 [&_.ql-toolbar]:rounded-t-xl [&_.ql-container]:border-border/40 [&_.ql-container]:rounded-b-xl [&_.ql-editor]:min-h-[350px] [&_.ql-editor]:text-sm [&_.ql-editor]:leading-relaxed focus-within:ring-2 focus-within:ring-bm-gold/20 focus-within:border-bm-gold [&_.ql-stroke]:stroke-foreground [&_.ql-fill]:fill-foreground [&_.ql-picker]:text-foreground [&_.ql-toolbar]:bg-muted/20">
                                            <ReactQuill
                                                theme="snow"
                                                value={data.content}
                                                onChange={(content) => setData('content', content)}
                                                modules={quillModules}
                                                placeholder="Write your amazing article here..."
                                            />
                                        </div>
                                        {errors.content && <p className="text-xs text-red-500 font-medium ml-1">{errors.content}</p>}
                                    </div>

                                    {/* SEO SECTION */}
                                    <div className="p-5 rounded-2xl border border-border/50 bg-muted/20 space-y-4">
                                        <h4 className="font-semibold flex items-center gap-2">
                                            <Globe className="size-4 text-bm-gold" /> SEO Settings
                                        </h4>
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Custom Slug</Label>
                                            <Input
                                                value={data.slug}
                                                onChange={(e) => setData('slug', e.target.value)}
                                                className="h-10 rounded-xl font-mono text-sm"
                                                placeholder="Leave empty to auto-generate"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Meta Title</Label>
                                            <Input
                                                value={data.meta_title}
                                                onChange={(e) => setData('meta_title', e.target.value)}
                                                className="h-10 rounded-xl"
                                                placeholder="Custom SEO Title"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Meta Description</Label>
                                            <Textarea
                                                value={data.meta_description}
                                                onChange={(e) => setData('meta_description', e.target.value)}
                                                className="min-h-[60px] rounded-xl text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SIDEBAR COLUMN */}
                                <div className="space-y-6">
                                    <div className="p-5 rounded-2xl border border-border/50 space-y-4 shadow-sm bg-background">
                                        <h4 className="font-semibold text-sm">Publishing</h4>
                                        <div className="grid gap-2">
                                            <Label className="text-xs">Status</Label>
                                            <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                                <SelectTrigger className="h-10 rounded-lg">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                    <SelectItem value="published">Published</SelectItem>
                                                    <SelectItem value="archived">Archived</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label className="text-xs">Schedule (Optional)</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                                <Input
                                                    type="datetime-local"
                                                    value={data.scheduled_at}
                                                    onChange={(e) => setData('scheduled_at', e.target.value)}
                                                    className="pl-9 h-10 rounded-lg text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 pt-2">
                                            <Switch
                                                id="is_featured"
                                                checked={data.is_featured}
                                                onCheckedChange={(checked) => setData('is_featured', checked)}
                                            />
                                            <Label htmlFor="is_featured" className="text-sm font-medium cursor-pointer">
                                                Featured Post
                                            </Label>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl border border-border/50 space-y-4 shadow-sm bg-background">
                                        <h4 className="font-semibold text-sm">Featured Image</h4>
                                        {imagePreview ? (
                                            <div className="relative group rounded-xl overflow-hidden border border-border/50 bg-muted/30">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-40 object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="secondary"
                                                        className="h-8 shadow-md"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        Change
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="destructive"
                                                        className="h-8 shadow-md"
                                                        onClick={handleRemoveImage}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className="h-40 rounded-xl border-2 border-dashed border-border/60 hover:border-bm-gold/50 hover:bg-bm-gold/5 transition-colors flex flex-col justify-center items-center gap-2 cursor-pointer"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <div className="p-3 bg-muted rounded-full">
                                                    <ImageIcon className="size-6 text-muted-foreground" />
                                                </div>
                                                <div className="text-sm font-medium text-muted-foreground">
                                                    Click to upload image
                                                </div>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        {errors.featured_image && <p className="text-xs text-red-500 font-medium">{errors.featured_image}</p>}
                                    </div>

                                    <div className="p-5 rounded-2xl border border-border/50 space-y-4 shadow-sm bg-background">
                                        <h4 className="font-semibold text-sm">Categories</h4>
                                        <div className="max-h-[160px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                            {categories.length === 0 ? (
                                                <div className="text-sm border p-3 rounded-lg border-dashed text-center text-muted-foreground">No categories defined yet.</div>
                                            ) : (
                                                categories.map(category => (
                                                    <div key={category.id} className="flex flex-row items-start space-x-3 space-y-0 relative border rounded-lg p-2.5 cursor-pointer hover:bg-muted/50">
                                                        <Checkbox
                                                            id={`cat-${category.id}`}
                                                            checked={data.categories.includes(category.id)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setData('categories', [...data.categories, category.id]);
                                                                } else {
                                                                    setData('categories', data.categories.filter(id => id !== category.id));
                                                                }
                                                            }}
                                                        />
                                                        <Label className="font-normal text-sm w-full cursor-pointer" htmlFor={`cat-${category.id}`}>
                                                            {category.name}
                                                        </Label>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl border border-border/50 space-y-4 shadow-sm bg-background">
                                        <h4 className="font-semibold text-sm">Tags</h4>
                                        <div className="max-h-[160px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                            {tags.length === 0 ? (
                                                <div className="text-sm border p-3 rounded-lg border-dashed text-center text-muted-foreground">No tags defined yet.</div>
                                            ) : (
                                                tags.map(tag => (
                                                    <div key={tag.id} className="flex flex-row items-start space-x-3 space-y-0 border rounded-lg p-2.5 cursor-pointer hover:bg-muted/50">
                                                        <Checkbox
                                                            id={`tag-${tag.id}`}
                                                            checked={data.tags.includes(tag.id)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setData('tags', [...data.tags, tag.id]);
                                                                } else {
                                                                    setData('tags', data.tags.filter(id => id !== tag.id));
                                                                }
                                                            }}
                                                        />
                                                        <Label className="font-normal text-sm w-full cursor-pointer opacity-90" htmlFor={`tag-${tag.id}`}>
                                                            {tag.name}
                                                        </Label>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="px-8 py-5 border-t border-border/40 shrink-0 bg-background/80 backdrop-blur-md">
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
                                {editingPost ? 'Save Changes' : 'Create Article'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
