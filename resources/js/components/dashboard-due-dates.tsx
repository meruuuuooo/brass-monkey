import { Clock, User, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CalendarItem {
    date: string;
    status: 'urgent' | 'pending' | 'completed';
}

interface DashboardDueDatesProps {
    selectedDate?: Date | null;
    onClearSelection?: () => void;
    serviceOrders?: Array<{
        id: number;
        tracking_number: string;
        customer_name: string;
        estimated_completion: string | null;
        created_at: string;
        status: string;
    }>;
}

export function DashboardDueDates({
    selectedDate,
    onClearSelection,
    serviceOrders = [],
}: DashboardDueDatesProps) {
    const filteredItems = selectedDate
        ? serviceOrders.filter((order) => {
              const displayDate =
                  order.estimated_completion || order.created_at;
              const orderDate = new Date(displayDate);

              return (
                  orderDate.getDate() === selectedDate.getDate() &&
                  orderDate.getMonth() === selectedDate.getMonth() &&
                  orderDate.getFullYear() === selectedDate.getFullYear()
              );
          })
        : serviceOrders.sort((a, b) => {
              const dateA = new Date(a.estimated_completion || a.created_at);
              const dateB = new Date(b.estimated_completion || b.created_at);

              return dateA.getTime() - dateB.getTime();
          }); // Show all, sorted by date

    const formatDateShort = (iso: string) => {
        return new Date(iso).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const mapStatusToColor = (status: string) => {
        const normalized = status.toLowerCase();

        if (normalized === 'completed' || normalized === 'done') {
            return 'completed';
        }

        if (normalized === 'urgent') {
            return 'urgent';
        }

        return 'pending';
    };

    return (
        <div className="flex h-full flex-col">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold tracking-tight text-foreground">
                        {selectedDate ? 'Appointments' : 'All Orders'}
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground">
                        {selectedDate
                            ? `Events for ${formatDateShort(selectedDate.toISOString())}`
                            : 'Upcoming work orders'}
                    </p>
                </div>
                {selectedDate && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearSelection}
                        className="h-8 gap-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase hover:text-foreground"
                    >
                        <X className="size-3" /> Clear
                    </Button>
                )}
            </div>

            <div className="scrollbar-hide flex-1 space-y-4 overflow-y-auto pr-2">
                {filteredItems.length > 0 ? (
                    filteredItems.map((order) => {
                        const displayDate =
                            order.estimated_completion || order.created_at;
                        const statusColor = mapStatusToColor(order.status);

                        return (
                            <div
                                key={order.id}
                                className="group flex items-center justify-between rounded-xl border border-border/40 bg-background p-4 transition-all hover:border-bm-gold/20 hover:bg-bm-gold/5"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={cn(
                                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                                            statusColor === 'urgent'
                                                ? 'bg-red-500/10 text-red-500'
                                                : statusColor === 'completed'
                                                  ? 'bg-emerald-500/10 text-emerald-500'
                                                  : 'bg-bm-gold/10 text-bm-gold',
                                        )}
                                    >
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold tracking-tight text-foreground/90 transition-colors group-hover:text-bm-gold">
                                            {order.service_type ||
                                                'Service Order'}
                                        </p>
                                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <User className="h-3 w-3" />{' '}
                                            {order.customer_name}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="mb-1 font-mono text-xs text-muted-foreground">
                                        {order.tracking_number}
                                    </p>
                                    <div className="flex flex-col items-end gap-1">
                                        <p className="text-sm font-black tracking-tighter text-foreground/90">
                                            {formatDateShort(displayDate)}
                                        </p>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                'h-4 border-none px-1.5 text-[10px] font-bold tracking-widest uppercase shadow-none',
                                                statusColor === 'urgent'
                                                    ? 'bg-red-500/10 text-red-500'
                                                    : statusColor ===
                                                        'completed'
                                                      ? 'bg-emerald-500/10 text-emerald-500'
                                                      : 'bg-bm-gold/10 text-bm-gold',
                                            )}
                                        >
                                            {order.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted opacity-20">
                            <Clock className="size-6" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                            No events for this date
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
