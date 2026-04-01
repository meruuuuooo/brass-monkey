import { Head, router, useForm } from '@inertiajs/react';
import {
    UserCircle2, Mail, CalendarDays, Tag, StickyNote, Trash2, Send,
} from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

interface Segment { id: number; name: string; color: string; }
interface Note { id: number; content: string; author: { id: number; name: string } | null; created_at: string; }

interface Customer {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    email_verified_at: string | null;
    segments: Segment[];
    customer_notes: Note[];
    created_at: string;
}

interface Props {
    customer: Customer;
    segments: Segment[];
}

export default function CustomerShow({ customer, segments }: Props) {
    const customerSegmentIds = customer.segments.map((s) => s.id);
    const [selectedSegments, setSelectedSegments] = useState<number[]>(customerSegmentIds);

    const noteForm = useForm({ content: '' });

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Customers', href: '/admin/customers' },
        { title: customer.name, href: '#' },
    ];

    const toggleSegment = (segId: number) => {
        setSelectedSegments((prev) =>
            prev.includes(segId) ? prev.filter((id) => id !== segId) : [...prev, segId]
        );
    };

    const saveSegments = () => {
        router.put(`/admin/customers/${customer.id}/segments`, { segment_ids: selectedSegments }, {
            preserveScroll: true,
            onSuccess: () => Swal.fire('Saved!', 'Segments updated.', 'success'),
        });
    };

    const addNote = (e: React.FormEvent) => {
        e.preventDefault();
        noteForm.post(`/admin/customers/${customer.id}/notes`, {
            preserveScroll: true,
            onSuccess: () => {
                noteForm.reset();
                Swal.fire('Added!', 'Note recorded.', 'success');
            },
        });
    };

    const deleteNote = (note: Note) => {
        Swal.fire({
            title: 'Delete note?', icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#d33', confirmButtonText: 'Delete',
        }).then((r) => {
            if (r.isConfirmed) {
router.delete(`/admin/customer-notes/${note.id}`, {
                preserveScroll: true,
                onSuccess: () => Swal.fire('Deleted!', 'Note removed.', 'success'),
            });
}
        });
    };

    const segmentsChanged = JSON.stringify([...selectedSegments].sort()) !== JSON.stringify([...customerSegmentIds].sort());

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={customer.name} />
            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                {/* Header Card */}
                <div className="rounded-3xl border border-border/40 bg-card p-6 flex items-start gap-6">
                    <div className="size-16 rounded-2xl bg-bm-gold/10 flex items-center justify-center shrink-0">
                        <UserCircle2 className="size-8 text-bm-gold" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <h1 className="text-2xl font-black tracking-tight">{customer.name}</h1>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Mail className="size-3.5" />{customer.email}</span>
                            <span className="flex items-center gap-1"><CalendarDays className="size-3.5" />Joined {new Date(customer.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {customer.segments.map((s) => (
                                <Badge key={s.id} variant="outline" className="rounded-lg text-xs font-bold" style={{ borderColor: s.color, color: s.color }}>
                                    {s.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <Badge variant={customer.is_active ? 'default' : 'secondary'} className="rounded-lg">
                        {customer.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Segments */}
                    <div className="rounded-3xl border border-border/40 bg-card p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <Tag className="size-5 text-bm-gold" />
                            <h2 className="text-lg font-bold">Segments</h2>
                        </div>
                        <div className="space-y-2">
                            {segments.map((s) => (
                                <label key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 cursor-pointer transition-colors">
                                    <Checkbox
                                        checked={selectedSegments.includes(s.id)}
                                        onCheckedChange={() => toggleSegment(s.id)}
                                    />
                                    <span className="inline-block size-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                                    <span className="text-sm font-medium">{s.name}</span>
                                </label>
                            ))}
                            {segments.length === 0 && <p className="text-sm text-muted-foreground">No segments created yet.</p>}
                        </div>
                        {segmentsChanged && (
                            <Button className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold rounded-xl w-full" onClick={saveSegments}>
                                Save Segments
                            </Button>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="rounded-3xl border border-border/40 bg-card p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <StickyNote className="size-5 text-bm-gold" />
                            <h2 className="text-lg font-bold">Notes</h2>
                        </div>
                        <form onSubmit={addNote} className="flex gap-2">
                            <Textarea
                                value={noteForm.data.content}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => noteForm.setData('content', e.target.value)}
                                className="min-h-[60px] rounded-xl border-border/40 bg-background/50 flex-1"
                                placeholder="Add a note..."
                                required
                            />
                            <Button type="submit" size="icon" className="bg-bm-gold hover:bg-bm-gold/90 text-black rounded-xl shrink-0 size-10 mt-auto" disabled={noteForm.processing}>
                                <Send className="size-4" />
                            </Button>
                        </form>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {customer.customer_notes.length > 0 ? customer.customer_notes.map((note) => (
                                <div key={note.id} className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-1 group">
                                    <p className="text-sm">{note.content}</p>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{note.author?.name} · {new Date(note.created_at).toLocaleString()}</span>
                                        <Button variant="ghost" size="icon" className="size-6 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600" onClick={() => deleteNote(note)}>
                                            <Trash2 className="size-3" />
                                        </Button>
                                    </div>
                                </div>
                            )) : <p className="text-sm text-muted-foreground">No notes yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
