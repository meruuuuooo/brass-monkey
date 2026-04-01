import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Search,
    Trash2,
    MessageCircle,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { DataTableWithPagination } from '@/components/data-table';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

interface BlogComment {
    id: number;
    post: {
        id: number;
        title: string;
        slug: string;
    };
    author: {
        id: number;
        name: string;
    };
    body: string;
    is_approved: boolean;
    created_at: string;
}

interface PaginatedComments {
    data: BlogComment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    comments: PaginatedComments;
}

export default function BlogCommentsIndex({ comments }: Props) {
    const [search, setSearch] = useState('');

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Blog Content', href: '/admin/blog-posts' },
        { title: 'Comments', href: '#' },
    ];

    const filteredData = useMemo(() => {
        if (!search) {
return comments.data;
}

        const q = search.toLowerCase();

        return comments.data.filter((c) =>
            c.body.toLowerCase().includes(q) ||
            c.post.title.toLowerCase().includes(q) ||
            c.author.name.toLowerCase().includes(q)
        );
    }, [comments.data, search]);

    const columns: ColumnDef<BlogComment>[] = useMemo(
        () => [
            {
                accessorKey: 'author.name',
                header: 'Author',
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-bm-gold/10 flex items-center justify-center">
                            <MessageCircle className="size-4 text-bm-gold" />
                        </div>
                        <div>
                            <div className="font-semibold">{row.original.author.name}</div>
                            <div className="text-xs text-muted-foreground">
                                on <span className="text-foreground">{row.original.post.title}</span>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'body',
                header: 'Comment',
                cell: ({ row }) => (
                    <div className="text-sm max-w-md truncate" title={row.original.body}>
                        {row.original.body}
                    </div>
                ),
            },
            {
                accessorKey: 'created_at',
                header: 'Date',
                cell: ({ row }) => (
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(row.original.created_at).toLocaleDateString()}
                    </div>
                ),
            },
            {
                accessorKey: 'is_approved',
                header: 'Status',
                cell: ({ row }) => (
                    row.original.is_approved ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="size-3" /> Approved
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 flex items-center gap-1 w-fit">
                            <XCircle className="size-3" /> Pending
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
                            size="sm"
                            className="h-8 cursor-pointer text-xs font-medium"
                            onClick={() => handleToggleApprove(row.original)}
                        >
                            {row.original.is_approved ? 'Unapprove' : 'Approve'}
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

    const renderGridItem = (comment: BlogComment) => (
        <div className="group relative bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden hover:shadow-md transition-all h-full flex flex-col p-5">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-bm-gold/10 flex items-center justify-center shrink-0">
                        <MessageCircle className="size-5 text-bm-gold" />
                    </div>
                    <div className="min-w-0 pr-2">
                        <div className="font-semibold text-base truncate">{comment.author.name}</div>
                        <div className="text-xs text-muted-foreground truncate">on {comment.post.title}</div>
                    </div>
                </div>
                <Badge variant="outline" className={`${comment.is_approved ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'} rounded-lg text-[10px] font-bold shrink-0`}>
                    {comment.is_approved ? 'Approved' : 'Pending'}
                </Badge>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                <p className="text-sm text-foreground line-clamp-3 mb-4 bg-muted/30 p-3 rounded-xl border border-border/40 relative z-10 italic">
                    "{comment.body}"
                </p>
                <div className="mt-auto">
                    <div className="text-xs text-muted-foreground pt-3 border-t border-border/40 flex justify-between items-center mb-3">
                        <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 relative z-10">
                        <Button variant={comment.is_approved ? "outline" : "default"} size="sm" className={`flex-1 h-8 text-xs font-bold ${comment.is_approved ? '' : 'bg-bm-gold hover:bg-bm-gold/90 text-black'}`} onClick={() => handleToggleApprove(comment)}>
                            {comment.is_approved ? 'Unapprove' : 'Approve'}
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0 cursor-pointer" onClick={() => handleDelete(comment)}>
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

    const handleToggleApprove = (comment: BlogComment) => {
        router.post(`/admin/blog-comments/${comment.id}/approve`, {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (comment: BlogComment) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Delete this comment permanently?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/blog-comments/${comment.id}`, {
                    onSuccess: () => {
                        Swal.fire('Deleted!', 'Comment has been deleted.', 'success');
                    },
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Blog Comments" />

            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Blog Comments"
                        description="Moderate user comments on blog posts."
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search comments..."
                            className="pl-9 rounded-xl border-border/40"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <DataTableWithPagination
                    columns={columns}
                    data={filteredData}
                    pagination={comments}
                    emptyMessage="No blog comments found."
                    onPageChange={(url) => router.get(url)}
                    renderGridItem={renderGridItem}
                />
            </div>
        </AppLayout>
    );
}
