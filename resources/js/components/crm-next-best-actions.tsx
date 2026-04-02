import { Link } from '@inertiajs/react';
import { Star, UserX, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface NextBestAction {
    type: 'retention' | 'review_request';
    priority: 'high' | 'medium' | 'low';
    icon: string;
    color: string;
    bg: string;
    message: string;
    customer_id: number;
    customer: { id: number; name: string; email: string };
    action_label: string;
    meta?: { tracking_number?: string };
}

interface Props {
    actions: NextBestAction[];
}

const iconMap: Record<string, React.ReactNode> = {
    UserX: <UserX className="size-4" />,
    Star: <Star className="size-4" />,
};

const priorityBadge: Record<string, string> = {
    high: 'bg-red-500/10 text-red-500 border-red-500/20',
    medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

export function CrmNextBestActions({ actions }: Props) {
    return (
        <Card className="rounded-2xl border-border/40 bg-background/50 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm font-bold">
                        <span className="flex size-5 items-center justify-center rounded-md bg-bm-gold/10 text-bm-gold">
                            <Star className="size-3.5" />
                        </span>
                        CRM · Next Best Actions
                    </CardTitle>
                    <Link
                        href="/admin/customers"
                        className="text-[10px] font-bold text-bm-gold hover:underline"
                    >
                        All Customers
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="max-h-[320px] space-y-2 overflow-y-auto">
                {actions.length > 0 ? (
                    actions.map((action, i) => (
                        <div
                            key={i}
                            className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/20 p-2.5"
                        >
                            <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ${action.bg} ${action.color}`}>
                                {iconMap[action.icon] ?? <Star className="size-3.5" />}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-sm font-semibold truncate">{action.customer.name}</span>
                                    <Badge
                                        variant="outline"
                                        className={`rounded-md px-1.5 py-0 text-[9px] font-bold ${priorityBadge[action.priority]}`}
                                    >
                                        {action.priority}
                                    </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                                    {action.message}
                                </p>
                                {action.meta?.tracking_number && (
                                    <p className="font-mono text-[10px] text-muted-foreground/70 mt-0.5">
                                        #{action.meta.tracking_number}
                                    </p>
                                )}
                            </div>
                            <Link
                                href={`/admin/customers/${action.customer_id}`}
                                className="shrink-0 flex items-center gap-1 rounded-lg border border-border/40 bg-background px-2 py-1 text-[10px] font-bold text-foreground hover:bg-muted/40 transition-colors"
                            >
                                {action.action_label}
                                <ExternalLink className="size-2.5" />
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                        <Star className="mx-auto mb-2 size-8 text-bm-gold/30" />
                        All customers are well-engaged!
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
