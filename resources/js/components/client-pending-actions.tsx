import { Link } from '@inertiajs/react';
import { Star, ClipboardCheck, ChevronRight, BellDot } from 'lucide-react';

export interface PendingAction {
    type: 'review_request' | 'estimate_approval';
    icon: string;
    color: string;
    bg: string;
    message: string;
    action_label: string;
    action_url: string;
    service_order_id: number;
    tracking_number: string;
}

interface Props {
    actions: PendingAction[];
}

const iconMap: Record<string, React.ReactNode> = {
    Star: <Star className="size-4" />,
    ClipboardCheck: <ClipboardCheck className="size-4" />,
};

export function ClientPendingActions({ actions }: Props) {
    if (actions.length === 0) {
return null;
}

    return (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-3">
                <BellDot className="size-4 text-amber-500" />
                <p className="text-sm font-bold text-amber-500 uppercase tracking-widest text-[10px]">
                    Action Required ({actions.length})
                </p>
            </div>
            {actions.map((action, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/50 p-3 hover:bg-muted/20 transition-colors"
                >
                    <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${action.bg} ${action.color}`}>
                        {iconMap[action.icon] ?? <Star className="size-4" />}
                    </span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug line-clamp-2">{action.message}</p>
                        <p className="font-mono text-[10px] text-muted-foreground mt-0.5">#{action.tracking_number}</p>
                    </div>
                    <Link
                        href={action.action_url}
                        className="shrink-0 flex items-center gap-1 rounded-lg bg-bm-gold/10 border border-bm-gold/20 px-3 py-1.5 text-[11px] font-bold text-bm-gold hover:bg-bm-gold/20 transition-colors whitespace-nowrap cursor-pointer"
                    >
                        {action.action_label}
                        <ChevronRight className="size-3" />
                    </Link>
                </div>
            ))}
        </div>
    );
}
