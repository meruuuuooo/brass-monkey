import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft, Wrench, Clock, CheckCircle2, AlertTriangle, AlertCircle,
    User, DollarSign, Calendar, MessageSquare, FileText, Activity, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Swal from 'sweetalert2';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock },
    accepted: { label: 'Accepted', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: CheckCircle2 },
    'in-progress': { label: 'In Progress', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: Wrench },
    ready: { label: 'Ready', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
    completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: AlertTriangle },
    cancelled: { label: 'Cancelled', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: AlertCircle },
};

interface Note {
    id: number; type: string; content: string; created_at: string;
    author: { id: number; name: string } | null;
}

interface Review { id: number; rating: number; comment: string | null; }

interface Job {
    id: number; tracking_number: string; status: string; priority: string;
    description: string | null;
    estimated_cost: number | null; actual_cost: number | null;
    estimated_completion: string | null; completed_at: string | null; created_at: string;
    service: { id: number; name: string } | null; service_type: string;
    assignee: { id: number; name: string } | null;
    notes: Note[];
    review: Review | null;
}

interface Props { job: Job; }

export default function ClientJobShow({ job }: Props) {
    const sCfg = statusConfig[job.status] || statusConfig.pending;
    const StatusIcon = sCfg.icon;

    const handleApproveEstimate = () => {
        Swal.fire({
            title: 'Approve Repair Estimate?',
            text: `You are approving an estimated repair cost of $${Number(job.estimated_cost).toFixed(2)}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#eab308',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, proceed with repair!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/my-jobs/${job.id}/approve`, {}, {
                    preserveScroll: true,
                    onSuccess: () => Swal.fire('Approved!', 'Work will begin shortly.', 'success'),
                });
            }
        });
    };

    const { data, setData, post, processing, reset } = useForm({
        rating: job.review?.rating || 0,
        comment: job.review?.comment || '',
    });

    const submitReview = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/my-jobs/${job.id}/review`, {
            preserveScroll: true,
            onSuccess: () => Swal.fire('Feedback Submitted', 'Thank you for your review!', 'success'),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'My Service Jobs', href: '/my-jobs' }, { title: job.tracking_number, href: '#' }]}>
            <Head title={`Job ${job.tracking_number}`} />
            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => router.get('/my-jobs')}><ArrowLeft className="size-5" /></Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black tracking-tight font-mono">{job.tracking_number}</h1>
                                <Badge variant="outline" className={`${sCfg.color} rounded-lg text-xs font-bold flex items-center gap-1`}><StatusIcon className="size-3" />{sCfg.label}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-4">
                                <span><Calendar className="size-3.5 inline mr-1" /> Created {new Date(job.created_at).toLocaleDateString()}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3 items-start">
                    <div className="md:col-span-2 space-y-6">
                        <Card className="border-border/40 bg-background/50 rounded-2xl shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/40"><CardTitle className="text-base font-bold flex items-center gap-2"><FileText className="size-4 text-bm-gold" />Job Details</CardTitle></CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase text-muted-foreground">Service</h4>
                                        <p className="font-semibold mt-1">{job.service?.name || job.service_type}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold uppercase text-muted-foreground">Technician</h4>
                                        <p className="font-semibold mt-1">{job.assignee?.name || 'Awaiting Assignment'}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground">Issue Description</h4>
                                    <div className="mt-2 text-sm bg-muted/30 p-4 rounded-xl border border-border/40 whitespace-pre-wrap leading-relaxed">
                                        {job.description || <span className="text-muted-foreground italic">No documentation provided.</span>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card className="border-border/40 bg-background/50 rounded-2xl shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/40"><CardTitle className="text-base font-bold flex items-center gap-2"><Activity className="size-4 text-bm-gold" />Repair Logs & Updates</CardTitle></CardHeader>
                            <CardContent className="pt-4">
                                <div className="space-y-4">
                                    {job.notes.length === 0 ? (
                                        <div className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border/60 rounded-xl">Your technician hasn't posted any updates yet. Check back soon.</div>
                                    ) : (
                                        job.notes.map(note => (
                                            <div key={note.id} className="p-4 rounded-xl bg-background border border-border/40 text-sm shadow-sm relative overflow-hidden">
                                                {note.type === 'estimate' && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />}
                                                {note.type === 'repair_log' && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />}
                                                {note.type === 'note' && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />}

                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-xs flex items-center gap-1.5 uppercase tracking-wide">
                                                        {note.type === 'note' ? <MessageSquare className="size-3.5 text-blue-500" /> : note.type === 'estimate' ? <DollarSign className="size-3.5 text-emerald-500" /> : <Wrench className="size-3.5 text-amber-500" />}
                                                        {note.type.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground font-medium">{new Date(note.created_at).toLocaleString()} by {note.author?.name || 'System'}</span>
                                                </div>
                                                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{note.content}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-border/40 bg-background/50 rounded-2xl shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/40"><CardTitle className="text-base font-bold flex items-center gap-2"><DollarSign className="size-4 text-bm-gold" />Cost & Approval</CardTitle></CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {job.status === 'pending' && job.estimated_cost && job.estimated_cost > 0 ? (
                                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                                        <p className="text-xs font-bold uppercase text-amber-600 mb-1">Awaiting Your Approval</p>
                                        <div className="font-mono font-black text-3xl mb-3 text-amber-600">${Number(job.estimated_cost).toFixed(2)}</div>
                                        <Button onClick={handleApproveEstimate} className="w-full bg-bm-gold hover:bg-bm-gold/90 text-black font-bold uppercase tracking-wider rounded-xl">Approve Estimate</Button>
                                        <p className="text-[10px] text-muted-foreground mt-2 opacity-75 leading-tight">By approving, you authorize our technicians to begin work on your vehicle.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between py-2 border-b border-border/40">
                                            <span className="text-sm font-semibold text-muted-foreground">Estimated</span>
                                            <span className="font-mono font-bold">${Number(job.estimated_cost || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-sm font-semibold text-muted-foreground">Actual Billed</span>
                                            <span className="font-mono font-black text-emerald-500">${Number(job.actual_cost || 0).toFixed(2)}</span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Feedback Section */}
                        {job.status === 'completed' && (
                            <Card className="border-border/40 bg-background/50 rounded-2xl shadow-sm overflow-hidden">
                                <CardHeader className="pb-3 border-b border-border/40 bg-bm-gold/5"><CardTitle className="text-base font-bold flex items-center gap-2"><Star className="size-4 text-bm-gold" />Service Rating</CardTitle></CardHeader>
                                <CardContent className="pt-4">
                                    <form onSubmit={submitReview} className="space-y-4">
                                        <div className="flex items-center justify-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setData('rating', star)}
                                                    className="focus:outline-none transition-transform active:scale-90"
                                                >
                                                    <Star
                                                        className={cn(
                                                            "size-8 transition-colors",
                                                            data.rating >= star ? "fill-bm-gold text-bm-gold" : "text-muted-foreground/30 hover:text-bm-gold/50"
                                                        )}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        <Textarea
                                            value={data.comment}
                                            onChange={(e) => setData('comment', e.target.value)}
                                            placeholder="Tell us about your experience..."
                                            className="rounded-xl bg-muted/30 border-border/40 resize-none min-h-[100px]"
                                        />
                                        <Button
                                            disabled={processing || data.rating === 0}
                                            type="submit"
                                            className="w-full rounded-xl bg-foreground text-background font-bold"
                                        >
                                            {job.review ? 'Update Feedback' : 'Submit Feedback'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
