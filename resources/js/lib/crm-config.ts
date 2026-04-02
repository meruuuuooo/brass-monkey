import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Info,
    Loader2,
    Megaphone,
    RotateCcw,
    Wrench,
    XCircle,
} from 'lucide-react';

export const notificationTypeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    system: { label: 'System', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Info },
    promotional: { label: 'Promo', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: Megaphone },
    alert: { label: 'Alert', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: AlertTriangle },
    info: { label: 'Info', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: Info },
};

export const notificationStatusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    draft: { label: 'Draft', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: Clock },
    sent: { label: 'Sent', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
};

export const serviceRequestStatusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock },
    accepted: { label: 'Accepted', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: CheckCircle2 },
    'in-progress': { label: 'In Progress', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: Wrench },
    ready: { label: 'Ready', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
    completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: AlertTriangle },
    cancelled: { label: 'Cancelled', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: AlertCircle },
};

export const serviceRequestPriorityConfig: Record<string, { label: string; color: string }> = {
    low: { label: 'Low', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
    normal: { label: 'Normal', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    high: { label: 'High', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    urgent: { label: 'Urgent', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

export const orderStatusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Loader2 },
    processing: { label: 'Processing', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Loader2 },
    completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: XCircle },
    refunded: { label: 'Refunded', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: RotateCcw },
};
