import { Head, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    CheckCircle2, 
    XCircle,
    ArrowUpDown,
    AlertCircle,
    Bell,
    CheckCircle,
    Info
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { DataTableWithPagination } from '@/components/data-table';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import AppLayout from '@/layouts/app-layout';

interface Announcement {
    id: number;
    title: string;
    content: string;
    type: 'info' | 'warning' | 'danger' | 'success';
    priority: number;
    is_active: boolean;
    starts_at: string | null;
    ends_at: string | null;
    created_at: string;
}

interface PaginatedAnnouncements {
    data: Announcement[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    announcements: PaginatedAnnouncements;
}

export default function AnnouncementsIndex({ announcements }: Props) {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        content: '',
        type: 'info' as string,
        priority: 0,
        is_active: true,
        starts_at: '',
        ends_at: '',
    });

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Announcements', href: '#' },
    ];

    const typeConfig = {
        info: { icon: Info, color: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: "Information" },
        warning: { icon: AlertCircle, color: "bg-orange-500/10 text-orange-500 border-orange-500/20", label: "Warning" },
        danger: { icon: XCircle, color: "bg-red-500/10 text-red-500 border-red-500/20", label: "Urgent" },
        success: { icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "Success" },
    };

    const columns: ColumnDef<Announcement>[] = useMemo(
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
                accessorKey: 'type',
                header: 'Type',
                cell: ({ row }) => {
                    const type = row.original.type;
                    const config = typeConfig[type];
                    const Icon = config.icon;

                    return (
                        <Badge variant="outline" className={`flex items-center gap-1.5 w-fit ${config.color}`}>
                            <Icon className="size-3" /> {config.label}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: 'priority',
                header: 'Priority',
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
                id: 'actions',
                cell: ({ row }) => (
                    <div className="flex justify-end gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-8 p-0"
                            onClick={() => handleEdit(row.original)}
                        >
                            <Edit2 className="size-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
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

    const handleEdit = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        setData({
            title: announcement.title,
            content: announcement.content,
            type: announcement.type,
            priority: announcement.priority,
            is_active: announcement.is_active,
            starts_at: announcement.starts_at ? announcement.starts_at.substring(0, 16) : '',
            ends_at: announcement.ends_at ? announcement.ends_at.substring(0, 16) : '',
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingAnnouncement(null);
        reset();
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingAnnouncement) {
            put(`/admin/announcements/${editingAnnouncement.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    Swal.fire('Updated!', 'Announcement has been updated.', 'success');
                },
            });
        } else {
            post('/admin/announcements', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    Swal.fire('Created!', 'Announcement has been created.', 'success');
                }
            });
        }
    };

    const handleDelete = (announcement: Announcement) => {
        Swal.fire({
            title: 'Delete Announcement?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/announcements/${announcement.id}`, {
                    onSuccess: () => {
                        Swal.fire('Deleted!', 'Announcement has been deleted.', 'success');
                    }
                });
            }
        });
    };

    const renderGridItem = (announcement: Announcement) => {
        const config = typeConfig[announcement.type];
        const Icon = config.icon;
        
        return (
            <Card className="h-full flex flex-col border-border/40 bg-background/50 transition-all hover:bg-bm-gold/5 hover:border-bm-gold/20 overflow-hidden">
                <div className={`h-1 w-full ${config.color.split(' ')[0]}`} />
                <CardContent className="p-5 flex flex-col h-full gap-4">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1 pr-2">
                            <div className="flex items-center gap-2 mb-1">
                                <Icon className={`size-3.5 ${config.color.split(' ')[1]}`} />
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color.split(' ')[1]}`}>{config.label}</span>
                            </div>
                            <h3 className="font-bold tracking-tight line-clamp-1">{announcement.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">{announcement.content}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Announcements" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading 
                        title="Announcements" 
                        description="Post critical updates and information for your clients."
                    />
                    <Button 
                        className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold rounded-xl gap-2 shadow-lg shadow-bm-gold/20"
                        onClick={handleCreate}
                    >
                        <Plus className="size-4" />
                        New Announcement
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search announcements..." 
                            className="pl-9 rounded-xl border-border/40 bg-background/50"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <DataTableWithPagination
                    columns={columns}
                    data={announcements.data}
                    pagination={announcements}
                    emptyMessage="No announcements found. Post your first update!"
                    onPageChange={(url) => router.get(url)}
                    renderGridItem={renderGridItem}
                />
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-3xl rounded-[2rem] border-none bg-background/95 backdrop-blur-2xl p-0 overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)]">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col h-full max-h-[90vh]">
                            <DialogHeader className="p-8 pb-4 border-b border-border/40">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-bm-gold/10 text-bm-gold">
                                        <Bell className="size-6" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-2xl font-black tracking-tight">
                                            {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                                        </DialogTitle>
                                        <DialogDescription className="text-sm font-medium text-muted-foreground/70">
                                            Broadcast important information to your clients' dashboards.
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Announcement Title</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="h-12 rounded-xl border-border/40 bg-background/50 text-base font-medium"
                                        placeholder="e.g. Scheduled Maintenance Notice"
                                        required
                                    />
                                    {errors.title && <p className="text-xs text-red-500 font-medium ml-1">{errors.title}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="content" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Content / Message</Label>
                                    <Textarea
                                        id="content"
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        className="min-h-[120px] rounded-xl border-border/40 bg-background/50 text-base leading-relaxed"
                                        placeholder="Describe the announcement in detail..."
                                        required
                                    />
                                    {errors.content && <p className="text-xs text-red-500 font-medium ml-1">{errors.content}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="type" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Announcement Type</Label>
                                        <Select value={data.type} onValueChange={(val: any) => setData('type', val)}>
                                            <SelectTrigger className="h-12 rounded-xl border-border/40 bg-background/50 capitalize">
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl p-1">
                                                <SelectItem value="info" className="rounded-xl focus:bg-blue-500/10 focus:text-blue-600 py-3 px-4 transition-colors font-medium">Information</SelectItem>
                                                <SelectItem value="warning" className="rounded-xl focus:bg-orange-500/10 focus:text-orange-600 py-3 px-4 transition-colors font-medium">Warning</SelectItem>
                                                <SelectItem value="danger" className="rounded-xl focus:bg-red-500/10 focus:text-red-600 py-3 px-4 transition-colors font-medium">Urgent / Critical</SelectItem>
                                                <SelectItem value="success" className="rounded-xl focus:bg-emerald-500/10 focus:text-emerald-600 py-3 px-4 transition-colors font-medium">Success / Milestone</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="priority" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Display Priority</Label>
                                        <Select value={data.priority.toString()} onValueChange={(val) => setData('priority', parseInt(val))}>
                                            <SelectTrigger className="h-12 rounded-xl border-border/40 bg-background/50">
                                                <SelectValue placeholder="Set Priority" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl p-1">
                                                <SelectItem value="10" className="rounded-xl focus:bg-bm-gold/10 focus:text-bm-gold font-bold py-3 px-4">Top Priority</SelectItem>
                                                <SelectItem value="5" className="rounded-xl focus:bg-bm-gold/10 focus:text-bm-gold font-medium py-3 px-4">High Priority</SelectItem>
                                                <SelectItem value="0" className="rounded-xl focus:bg-bm-gold/10 focus:text-bm-gold font-medium py-3 px-4">Normal Priority</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="starts_at" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Starts At (Optional)</Label>
                                        <Input
                                            id="starts_at"
                                            type="datetime-local"
                                            value={data.starts_at}
                                            onChange={(e) => setData('starts_at', e.target.value)}
                                            className="h-12 rounded-xl border-border/40 bg-background/50"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="ends_at" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Ends At (Optional)</Label>
                                        <Input
                                            id="ends_at"
                                            type="datetime-local"
                                            value={data.ends_at}
                                            onChange={(e) => setData('ends_at', e.target.value)}
                                            className="h-12 rounded-xl border-border/40 bg-background/50"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/40">
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                    <Label htmlFor="is_active" className="text-sm font-bold cursor-pointer">
                                        Announcement is Active and Visible
                                    </Label>
                                </div>
                            </div>

                            <DialogFooter className="p-8 pt-4 border-t border-border/40 bg-background/80 backdrop-blur-md">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl">Cancel</Button>
                                <Button 
                                    type="submit" 
                                    className="bg-bm-gold hover:bg-bm-gold/90 text-black font-black px-10 rounded-xl shadow-lg shadow-bm-gold/20" 
                                    disabled={processing}
                                >
                                    {editingAnnouncement ? 'Update Announcement' : 'Post Announcement'}
                                </Button>
                            </DialogFooter>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
