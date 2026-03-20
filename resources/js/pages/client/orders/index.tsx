import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    PackageCheck, 
    Calendar,
    Clock,
    Wrench,
    CheckCircle2,
    XCircle,
    Info,
    Hash,
    MoreVertical,
    Eye,
    ClipboardList
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { BreadcrumbItem } from '@/types';

interface Order {
    id: number;
    tracking_number: string;
    customer_name: string;
    service_type: string;
    status: 'pending' | 'accepted' | 'completed' | 'rejected';
    description: string | null;
    estimated_completion: string | null;
    created_at: string;
}

interface PaginatedData<T> {
    data: T[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    orders: PaginatedData<Order>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Orders', href: '/my-orders' },
];

export default function MyOrders({ orders }: Props) {
    const [viewOrder, setViewOrder] = useState<Order | null>(null);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': 
                return <Badge variant="outline" className="bg-amber-50 text-amber-600 hover:bg-amber-50 hover:text-amber-600 border-amber-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
            case 'accepted': 
                return <Badge variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-50 hover:text-blue-600 border-blue-200"><Info className="w-3 h-3 mr-1" /> Accepted</Badge>;
            case 'completed': 
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-600 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
            case 'rejected': 
                return <Badge variant="outline" className="bg-rose-50 text-rose-600 hover:bg-rose-50 hover:text-rose-600 border-rose-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
            default: 
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Orders" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full pb-20">
                {/* Header Section */}
                <div className="flex items-center justify-between pt-2">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Orders</h1>
                        <p className="text-muted-foreground">View the status and updates of your service requests.</p>
                    </div>
                </div>

                {/* Orders Table */}
                <Card className="border-sidebar-border/50 shadow-sm overflow-hidden mt-2">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[150px]">Tracking No.</TableHead>
                                <TableHead>Service Type</TableHead>
                                <TableHead>Date Requested</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.data.length > 0 ? (
                                orders.data.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-muted/20 transition-colors">
                                        <TableCell className="font-medium text-bm-gold">{order.tracking_number}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted">
                                                    <Wrench className="h-3 w-3 text-muted-foreground" />
                                                </div>
                                                <span className="font-medium">{order.service_type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-muted-foreground">
                                                <Calendar className="mr-1.5 h-3.5 w-3.5" />
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
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground italic">
                                        You don't have any service bookings yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {/* View Order Details Modal */}
            <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
                <DialogContent className="sm:max-w-xl rounded-3xl border-border/50 bg-background overflow-hidden p-0">
                    {viewOrder && (
                        <div className="flex flex-col">
                            <DialogHeader className="p-6 md:p-8 pb-6 border-b border-border/40 bg-muted/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <DialogTitle className="text-xl md:text-2xl font-black tracking-tight mb-2">
                                            Order Details
                                        </DialogTitle>
                                        <DialogDescription className="text-sm font-medium">
                                            Detailed view for order <span className="text-bm-gold font-bold">{viewOrder.tracking_number}</span>
                                        </DialogDescription>
                                    </div>
                                    <div>
                                        {getStatusBadge(viewOrder.status)}
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="p-6 md:p-8 space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Service Type</p>
                                        <div className="flex items-center gap-2">
                                            <Wrench className="w-3.5 h-3.5 text-muted-foreground" />
                                            <p className="font-bold text-foreground text-sm">{viewOrder.service_type}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Date Requested</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                            <p className="font-bold text-foreground text-sm">
                                                {new Date(viewOrder.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    {viewOrder.estimated_completion && (
                                        <div className="space-y-1 col-span-2 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">Estimated Completion</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                                                <p className="font-bold text-amber-700 dark:text-amber-400 text-sm">
                                                    {new Date(viewOrder.estimated_completion).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Request Notes</p>
                                    <div className="bg-muted/30 rounded-2xl p-4 border border-border/50 min-h-[100px]">
                                        {viewOrder.description ? (
                                            <p className="text-sm font-medium leading-relaxed">
                                                {viewOrder.description}
                                            </p>
                                        ) : (
                                            <p className="text-sm italic text-muted-foreground/70">
                                                No additional notes or description provided for this request.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 border-t border-border/40 bg-muted/10 flex justify-end">
                                <Button onClick={() => setViewOrder(null)}>
                                    Close Details
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
