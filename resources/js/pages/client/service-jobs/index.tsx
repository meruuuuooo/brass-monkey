import { Head, Link } from '@inertiajs/react';
import { Wrench, Calendar } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
// import AppLayout from '@/layouts/app-layout';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { serviceRequestStatusConfig } from '@/lib/crm-config';

interface Job {
    id: number; tracking_number: string; status: string; priority: string;
    created_at: string; estimated_completion: string | null;
    service: { id: number; name: string } | null;
    assignee: { id: number; name: string } | null;
}

interface Props {
    jobs: { data: Job[]; links: any[]; current_page: number; last_page: number };
}

export default function ClientJobsIndex({ jobs }: Props) {
    return (
        <AppHeaderLayout>
            <Head title="My Service Jobs" />
            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 ">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading title="My Service Jobs" description="Track the progress of your repairs and services." />
                    <Button asChild className="rounded-xl w-full sm:w-auto bg-bm-gold hover:bg-bm-gold/90 text-black font-bold cursor-pointer">
                        <Link href="/services" className="cursor-pointer">Book New Service</Link>
                    </Button>
                </div>

                {jobs.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 mt-4 space-y-4 rounded-2xl border border-dashed border-border/60 bg-muted/20">
                        <Wrench className="size-10 text-muted-foreground" />
                        <h4 className="text-lg font-bold">No Service Jobs</h4>
                        <p className="text-muted-foreground text-sm">You do not have any active or past service jobs.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.data.map(job => {
                            const cfg = serviceRequestStatusConfig[job.status] || serviceRequestStatusConfig.pending;
                            const StatusIcon = cfg.icon;

                            return (
                                <Card key={job.id} className="rounded-2xl border-border/40 bg-background/50 hover:border-bm-gold/50 transition-colors group overflow-hidden shadow-sm">
                                    <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Link href={`/my-jobs/${job.id}`} className="font-mono font-black text-lg tracking-tight hover:text-bm-gold transition-colors cursor-pointer">
                                                    {job.tracking_number}
                                                </Link>
                                                <Badge variant="outline" className={`${cfg.color} text-[10px] font-bold px-2 py-0.5 flex items-center gap-1 uppercase tracking-wider`}>
                                                    <StatusIcon className="size-3" />
                                                    {cfg.label}
                                                </Badge>
                                            </div>
                                            <h3 className="font-bold text-base mb-1">{job.service?.name || 'Custom Service'}</h3>
                                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1"><Calendar className="size-3.5" /> Booked: {new Date(job.created_at).toLocaleDateString()}</span>
                                                {job.assignee && (
                                                    <span className="flex items-center gap-1"><Wrench className="size-3.5" /> Tech: {job.assignee.name}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0">
                                            <Button variant="secondary" className="w-full sm:w-auto rounded-xl shadow-none cursor-pointer" asChild>
                                                <Link href={`/my-jobs/${job.id}`} className="cursor-pointer">View Details</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                        <Pagination links={jobs.links} className="mt-6" />
                    </div>
                )}
            </div>
        </AppHeaderLayout>
    );
}
