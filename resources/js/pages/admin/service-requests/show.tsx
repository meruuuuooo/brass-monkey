import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft, Wrench,
    User, DollarSign, Calendar, MessageSquare, FileText, Activity, UserCircle2, Save,
} from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { serviceRequestPriorityConfig, serviceRequestStatusConfig } from '@/lib/crm-config';

interface Note {
    id: number; type: string; content: string; created_at: string;
    author: { id: number; name: string } | null;
}

interface Job {
    id: number; tracking_number: string; status: string; priority: string;
    customer_name: string; description: string | null;
    estimated_cost: number | null; actual_cost: number | null;
    estimated_completion: string | null; completed_at: string | null; created_at: string;
    service_type: string;
    customer: { id: number; name: string; email: string; phone: string | null } | null;
    assignee: { id: number; name: string } | null;
    service: { id: number; name: string; price: number } | null;
    notes: Note[];
}

interface Props { job: Job; technicians: { id: number; name: string }[]; }

export default function ServiceRequestShow({ job, technicians }: Props) {
    const sCfg = serviceRequestStatusConfig[job.status] || serviceRequestStatusConfig.pending;
    const pCfg = serviceRequestPriorityConfig[job.priority] || serviceRequestPriorityConfig.normal;
    const StatusIcon = sCfg.icon;

    const mainForm = useForm({
        status: job.status,
        assigned_to: job.assignee?.id ? String(job.assignee.id) : 'unassigned',
        priority: job.priority,
        estimated_cost: job.estimated_cost ?? '',
        actual_cost: job.actual_cost ?? '',
    });

    const noteForm = useForm({ type: 'note', content: '' });

    const [isEditingCosts, setIsEditingCosts] = useState(false);

    const handleUpdate = (field: string, value: string) => {
        mainForm.setData(field as any, value);
        router.put(`/admin/service-requests/${job.id}`, { [field]: value === 'unassigned' ? null : value }, {
            preserveScroll: true,
            onSuccess: () => Swal.fire('Updated', '', 'success'),
        });
    };

    const handleSaveCosts = () => {
        router.put(`/admin/service-requests/${job.id}`, {
            estimated_cost: mainForm.data.estimated_cost,
            actual_cost: mainForm.data.actual_cost,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditingCosts(false);
                Swal.fire('Saved', 'Costs updated.', 'success');
            },
        });
    };

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        noteForm.post(`/admin/service-requests/${job.id}/notes`, {
            preserveScroll: true,
            onSuccess: () => noteForm.reset('content'),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Service Jobs', href: '/admin/service-requests' }, { title: job.tracking_number, href: '#' }]}>
            <Head title={`Job ${job.tracking_number}`} />
            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => router.get('/admin/service-requests')}><ArrowLeft className="size-5" /></Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black tracking-tight font-mono">{job.tracking_number}</h1>
                                <Badge variant="outline" className={`${sCfg.color} rounded-lg text-xs font-bold flex items-center gap-1`}><StatusIcon className="size-3" />{sCfg.label}</Badge>
                                <Badge variant="outline" className={`${pCfg.color} rounded-lg text-xs font-bold`}>{pCfg.label}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-4">
                                <span><Calendar className="size-3.5 inline mr-1" /> Created {new Date(job.created_at).toLocaleDateString()}</span>
                                {job.customer && <span><User className="size-3.5 inline mr-1" /> {job.customer.name}</span>}
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
                                        <h4 className="text-xs font-bold uppercase text-muted-foreground">Customer</h4>
                                        <p className="font-semibold mt-1">{job.customer_name}</p>
                                        {job.customer?.email && <p className="text-sm text-muted-foreground">{job.customer.email}</p>}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground">Issue Description</h4>
                                    <div className="mt-2 text-sm bg-muted/30 p-3 rounded-xl border border-border/40 whitespace-pre-wrap min-h-[60px]">
                                        {job.description || <span className="text-muted-foreground italic">No description provided.</span>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card className="border-border/40 bg-background/50 rounded-2xl shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/40"><CardTitle className="text-base font-bold flex items-center gap-2"><Activity className="size-4 text-bm-gold" />Job Timeline</CardTitle></CardHeader>
                            <CardContent className="pt-4">
                                <div className="space-y-4 mb-6">
                                    {job.notes.length === 0 ? (
                                        <div className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border/60 rounded-xl">No notes or logs yet.</div>
                                    ) : (
                                        job.notes.map(note => (
                                            <div key={note.id} className="p-3 rounded-xl bg-background border border-border/40 text-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold text-xs flex items-center gap-1.5 uppercase tracking-wide">
                                                        {note.type === 'note' ? <MessageSquare className="size-3.5 text-blue-500" /> : note.type === 'estimate' ? <DollarSign className="size-3.5 text-emerald-500" /> : <Wrench className="size-3.5 text-amber-500" />}
                                                        {note.type.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">{new Date(note.created_at).toLocaleString()} by {note.author?.name || 'System'}</span>
                                                </div>
                                                <p className="whitespace-pre-wrap text-muted-foreground">{note.content}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <form onSubmit={handleAddNote} className="space-y-3 bg-muted/20 p-3 rounded-xl border border-border/40">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Add Update</Label>
                                        <Select value={noteForm.data.type} onValueChange={(v) => noteForm.setData('type', v)}>
                                            <SelectTrigger className="w-[130px] h-8 rounded-lg text-xs"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="note" className="text-xs">General Note</SelectItem>
                                                <SelectItem value="estimate" className="text-xs">Cost Estimate</SelectItem>
                                                <SelectItem value="repair_log" className="text-xs">Repair Log</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Textarea placeholder="Write your update here..." className="rounded-xl text-sm min-h-[80px]" value={noteForm.data.content} onChange={(e) => noteForm.setData('content', e.target.value)} required />
                                    <div className="flex justify-end">
                                        <Button type="submit" size="sm" className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold rounded-xl" disabled={noteForm.processing || !noteForm.data.content.trim()}>Post Update</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-border/40 bg-background/50 rounded-2xl shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/40"><CardTitle className="text-base font-bold flex items-center gap-2"><Wrench className="size-4 text-bm-gold" />Management</CardTitle></CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Status Workflow</Label>
                                    <Select value={mainForm.data.status} onValueChange={(v) => handleUpdate('status', v)}>
                                        <SelectTrigger className="rounded-xl font-semibold"><SelectValue /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {Object.entries(serviceRequestStatusConfig).map(([k, v]) => <SelectItem key={k} value={k} className="rounded-xl">{v.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Priority</Label>
                                    <Select value={mainForm.data.priority} onValueChange={(v) => handleUpdate('priority', v)}>
                                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {Object.entries(serviceRequestPriorityConfig).map(([k, v]) => <SelectItem key={k} value={k} className="rounded-xl">{v.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Technician / Assignee</Label>
                                    <Select value={mainForm.data.assigned_to} onValueChange={(v) => handleUpdate('assigned_to', v)}>
                                        <SelectTrigger className="rounded-xl"><UserCircle2 className="size-4 mr-2 opacity-50" /><SelectValue /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="unassigned" className="rounded-xl italic">Unassigned</SelectItem>
                                            {technicians.map(t => <SelectItem key={t.id} value={String(t.id)} className="rounded-xl">{t.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Estimated Completion</Label>
                                    <Input type="date" className="rounded-xl" value={job.estimated_completion ? new Date(job.estimated_completion).toISOString().split('T')[0] : ''} onChange={(e) => handleUpdate('estimated_completion', e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/40 bg-background/50 rounded-2xl shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/40"><CardTitle className="text-base font-bold flex items-center gap-2"><DollarSign className="size-4 text-bm-gold" />Financials</CardTitle></CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {isEditingCosts ? (
                                    <>
                                        <div className="grid gap-1.5">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Estimated Cost ($)</Label>
                                            <Input type="number" step="0.01" className="rounded-xl" value={mainForm.data.estimated_cost} onChange={(e) => mainForm.setData('estimated_cost', e.target.value)} />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Actual Cost ($)</Label>
                                            <Input type="number" step="0.01" className="rounded-xl" value={mainForm.data.actual_cost} onChange={(e) => mainForm.setData('actual_cost', e.target.value)} />
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                            <Button variant="outline" size="sm" className="rounded-xl flex-1 border-border/60" onClick={() => setIsEditingCosts(false)}>Cancel</Button>
                                            <Button size="sm" className="rounded-xl flex-1 bg-bm-gold hover:bg-bm-gold/90 text-black font-bold" onClick={handleSaveCosts}><Save className="size-3.5 mr-1.5" />Save</Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between py-2 border-b border-border/40">
                                            <span className="text-sm font-semibold text-muted-foreground">Estimated</span>
                                            <span className="font-mono font-bold">${Number(job.estimated_cost || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-sm font-semibold text-muted-foreground">Actual</span>
                                            <span className="font-mono font-black text-emerald-500">${Number(job.actual_cost || 0).toFixed(2)}</span>
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full rounded-xl mt-2 border-border/60" onClick={() => setIsEditingCosts(true)}>Edit Costs</Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
