import { Clock, User, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DueDateItem {
    id: number;
    title: string;
    customer: string;
    date: string; // ISO string 
    status: 'urgent' | 'pending' | 'completed';
}

const mockDueDates: DueDateItem[] = [
    { id: 1001, title: 'Precision Balancing', customer: 'John Doe', date: new Date().toISOString().split('T')[0], status: 'urgent' },
    { id: 1003, title: 'Diagnostic', customer: 'Alex Reed', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], status: 'urgent' },
    { id: 1002, title: 'Full Restoration', customer: 'Jane Smith', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], status: 'completed' },
];

interface DashboardDueDatesProps {
    selectedDate?: Date | null;
    onClearSelection?: () => void;
}

export function DashboardDueDates({ selectedDate, onClearSelection }: DashboardDueDatesProps) {
    const filteredItems = selectedDate
        ? mockDueDates.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate.getDate() === selectedDate.getDate() &&
                   itemDate.getMonth() === selectedDate.getMonth() &&
                   itemDate.getFullYear() === selectedDate.getFullYear();
        })
        : mockDueDates;

    const formatDateShort = (iso: string) => {
        return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold tracking-tight text-foreground">
                        {selectedDate ? 'Appointments' : 'Due Dates'}
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground">
                        {selectedDate ? `Events for ${formatDateShort(selectedDate.toISOString())}` : 'Upcoming deadlines'}
                    </p>
                </div>
                {selectedDate && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={onClearSelection}
                        className="h-8 gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
                    >
                        <X className="size-3" /> Clear
                    </Button>
                )}
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 scrollbar-hide">
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className="group flex items-center justify-between p-4 rounded-xl border border-border/40 bg-background transition-all hover:bg-bm-gold/5 hover:border-bm-gold/20"
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                                    item.status === 'urgent' ? "bg-red-500/10 text-red-500" :
                                    item.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" : "bg-bm-gold/10 text-bm-gold"
                                )}>
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold tracking-tight text-foreground/90 group-hover:text-bm-gold transition-colors">{item.title}</p>
                                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                        <User className="h-3 w-3" /> {item.customer}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-foreground/90 tracking-tighter">{formatDateShort(item.date)}</p>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "mt-1 text-[10px] font-bold uppercase tracking-widest px-1.5 h-4 border-none shadow-none",
                                        item.status === 'urgent' ? "bg-red-500/10 text-red-500" :
                                        item.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" : "bg-bm-gold/10 text-bm-gold"
                                    )}
                                >
                                    {item.status}
                                </Badge>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4 opacity-20">
                            <Clock className="size-6" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">No events for this date</p>
                    </div>
                )}
            </div>
        </div>
    );
}

