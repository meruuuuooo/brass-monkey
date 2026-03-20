import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    ClipboardList,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock,
    CheckCircle2,
    X,
    MessageSquare,
    Eye,
    CalendarCheck,
    Wrench
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';
import { BreadcrumbItem } from '@/types';

interface ServiceOrder {
    id: number;
    tracking_number: string;
    customer_name: string;
    service_type: string;
    status: 'pending' | 'accepted' | 'completed' | 'rejected' | 'cancelled';
    description: string | null;
    estimated_completion: string | null;
    created_at: string;
}

interface PaginatedData {
    data: ServiceOrder[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    requests: PaginatedData;
    filters: {
        status: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Administration', href: '#' },
    { title: 'Service Bookings', href: '/admin/service-requests' },
];

export default function ServiceRequestsIndex({ requests, filters }: Props) {
    const [viewOrder, setViewOrder] = useState<ServiceOrder | null>(null);

    const handleStatusChange = (order: ServiceOrder, newStatus: string) => {
        router.put(`/admin/service-requests/${order.id}`, { status: newStatus }, {
            preserveScroll: true,
        });
    };

    const handleFilter = (status: string) => {
        router.get('/admin/service-requests', { status }, { preserveState: true, preserveScroll: true });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="text-yellow-600 bg-yellow-500/10 border-yellow-500/20 rounded-full px-3 py-1"><Clock className="mr-1.5 size-3.5"/> Pending</Badge>;
            case 'accepted': return <Badge variant="outline" className="text-blue-600 bg-blue-500/10 border-blue-500/20 rounded-full px-3 py-1"><CheckCircle className="mr-1.5 size-3.5"/> Accepted</Badge>;
            case 'completed': return <Badge variant="outline" className="text-green-600 bg-green-500/10 border-green-500/20 rounded-full px-3 py-1"><CheckCircle2 className="mr-1.5 size-3.5"/> Completed</Badge>;
            case 'rejected': return <Badge variant="outline" className="text-red-600 bg-red-500/10 border-red-500/20 rounded-full px-3 py-1"><XCircle className="mr-1.5 size-3.5"/> Rejected</Badge>;
            case 'cancelled': return <Badge variant="outline" className="text-gray-600 bg-gray-500/10 border-gray-500/20 rounded-full px-3 py-1"><X className="mr-1.5 size-3.5"/> Cancelled</Badge>;
            default: return <Badge className="rounded-full px-3 py-1">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service Bookings" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Service Requests</h1>
                        <p className="text-muted-foreground">Review and manage incoming service bookings from your clients.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {['all', 'pending', 'accepted', 'completed', 'rejected'].map(status => (
                        <Button 
                            key={status}
                            variant={filters.status === status ? 'default' : 'outline'}
                            onClick={() => handleFilter(status)}
                            className="capitalize"
                        >
                            {status}
                        </Button>
                    ))}
                </div>

                <Card className="border-sidebar-border/50 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[150px]">Tracking No.</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Date Booked</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.data.length > 0 ? (
                                requests.data.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-muted/20 transition-colors">
                                        <TableCell className="font-medium text-bm-gold">{order.tracking_number}</TableCell>
                                        <TableCell>{order.customer_name}</TableCell>
                                        <TableCell>{order.service_type}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-muted-foreground">
                                                <Clock className="mr-1.5 h-3.5 w-3.5" />
                                                {new Date(order.created_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(order.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-full">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/50">
                                                    <DropdownMenuItem className="cursor-pointer" onClick={() => setViewOrder(order)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details & Notes
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {order.status !== 'accepted' && (
                                                        <DropdownMenuItem className="cursor-pointer focus:bg-blue-50 focus:text-blue-600" onClick={() => handleStatusChange(order, 'accepted')}>
                                                            <CheckCircle className="mr-2 h-4 w-4" /> Mark as Accepted
                                                        </DropdownMenuItem>
                                                    )}
                                                    {order.status !== 'completed' && (
                                                        <DropdownMenuItem className="cursor-pointer focus:bg-green-50 focus:text-green-600" onClick={() => handleStatusChange(order, 'completed')}>
                                                            <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Completed
                                                        </DropdownMenuItem>
                                                    )}
                                                    {order.status !== 'rejected' && (
                                                        <DropdownMenuItem className="cursor-pointer focus:bg-red-50 focus:text-red-600" onClick={() => handleStatusChange(order, 'rejected')}>
                                                            <XCircle className="mr-2 h-4 w-4" /> Mark as Rejected
                                                        </DropdownMenuItem>
                                                    )}
                                                    {order.status !== 'pending' && (
                                                        <DropdownMenuItem className="cursor-pointer focus:bg-yellow-50 focus:text-yellow-600" onClick={() => handleStatusChange(order, 'pending')}>
                                                            <Clock className="mr-2 h-4 w-4" /> Revert to Pending
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center text-muted-foreground italic">
                                        {filters.status !== 'all' 
                                            ? `There are no requests currently marked as ${filters.status}.` 
                                            : "You don't have any service bookings yet."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>


            {/* View Order Details Modal */}
            <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
                <DialogContent className="sm:max-w-2xl rounded-3xl border-none bg-background/95 backdrop-blur-2xl p-0 overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)]">
                    {viewOrder && (
                        <div className="flex flex-col">
                            <DialogHeader className="p-8 pb-6 border-b border-border/40 bg-muted/10 relative">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                    <ClipboardList className="size-40 text-foreground -rotate-12" />
                                </div>
                                <div className="flex items-center justify-between relative z-10">
                                    <div>
                                        <DialogTitle className="text-2xl font-black tracking-tight mb-2">
                                            Request Details
                                        </DialogTitle>
                                        <DialogDescription className="text-sm font-medium">
                                            Detailed view for booking <span className="text-bm-gold font-bold">{viewOrder.tracking_number}</span>
                                        </DialogDescription>
                                    </div>
                                    <div className="hidden sm:block">
                                        {getStatusBadge(viewOrder.status)}
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Customer</p>
                                        <p className="font-bold text-foreground text-sm">{viewOrder.customer_name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Service Booked</p>
                                        <p className="font-bold text-foreground text-sm">{viewOrder.service_type}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Date Submitted</p>
                                        <p className="font-bold text-foreground text-sm">
                                            {new Date(viewOrder.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="space-y-1 lg:hidden">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Current Status</p>
                                        <div className="mt-1">{getStatusBadge(viewOrder.status)}</div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-muted/30 border border-border/40 space-y-3">
                                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                                        <MessageSquare className="size-4 text-bm-gold" /> Client Notes
                                    </h4>
                                    <p className="text-sm leading-relaxed text-foreground font-medium whitespace-pre-wrap">
                                        {viewOrder.description || <span className="italic text-muted-foreground">No additional notes provided by the client.</span>}
                                    </p>
                                </div>
                                
                                <div className="pt-4 border-t border-border/40 flex flex-wrap gap-3 items-center justify-between">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Quick Actions</p>
                                    <div className="flex gap-2">
                                        {viewOrder.status !== 'accepted' && (
                                            <Button size="sm" variant="outline" className="rounded-xl border-blue-500/20 text-blue-600 hover:bg-blue-500/10" onClick={() => handleStatusChange(viewOrder, 'accepted')}>Accept</Button>
                                        )}
                                        {viewOrder.status !== 'completed' && (
                                            <Button size="sm" variant="outline" className="rounded-xl border-green-500/20 text-green-600 hover:bg-green-500/10" onClick={() => handleStatusChange(viewOrder, 'completed')}>Complete</Button>
                                        )}
                                        {viewOrder.status !== 'rejected' && (
                                            <Button size="sm" variant="outline" className="rounded-xl border-red-500/20 text-red-600 hover:bg-red-500/10" onClick={() => handleStatusChange(viewOrder, 'rejected')}>Reject</Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <DialogFooter className="p-8 pt-4 border-t border-border/40 bg-background/80 backdrop-blur-md">
                                <Button 
                                    onClick={() => setViewOrder(null)} 
                                    className="bg-bm-gold hover:bg-bm-gold/90 text-black font-bold px-8 rounded-xl shadow-lg shadow-bm-gold/20"
                                >
                                    Done
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
