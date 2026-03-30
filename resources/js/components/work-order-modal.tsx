import { useEffect, useState, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    X,
    FileText,
    MessageSquare,
    CheckSquare,
    Square,
    Package,
    Clock,
    Mail,
    Eye,
    Printer,
    Send,
    Plus,
    Paperclip,
    AlertTriangle,
    User,
    Calendar,
    Wrench,
    Loader2,
    AlertCircle,
} from 'lucide-react';

/* ────────────────────────────────────────────
   Types – mirrors the Kanban API response
   ──────────────────────────────────────────── */

interface KanbanUser {
    id: number;
    name: string;
    avatar?: string;
}

interface KanbanComment {
    id: number;
    comment: string;
    user: KanbanUser;
    attachment: string | null;
    attachment_type: string | null;
    created_at: string;
}

interface KanbanPart {
    id: number;
    part_name: string;
    sku: string;
    quantity: number;
    unit: string;
    status: string;
    supplier: string;
    unit_price: string;
    cost_of_parts: string;
    eta_date: string;
    notes: string;
}

interface KanbanSubtask {
    id: number;
    title: string;
    is_done: boolean;
}

interface KanbanTask {
    id: number;
    title: string;
    status: string;
    priority: string;
    progress: number;
    due_date: string;
    customer_name: string;
    work_order_number: string;
    equipment: string;
    model_no: string;
    serial_no: string;
    representative: string;
    description: string;
    is_overdue: boolean;
    comments_count: number;
    parts_count: number;
    subtasks_count: number;
    attachments_count: number;
    assigned_to: KanbanUser | null;
    comments: KanbanComment[];
    parts: KanbanPart[];
    subtasks: KanbanSubtask[];
}

interface KanbanColumn {
    slug: string;
    name: string;
    color: string;
    order: number;
    tasks_count: number;
    tasks: KanbanTask[];
}

interface KanbanBoardData {
    project: { id: number; name: string; status: string; progress: number; due_date: string };
    columns: KanbanColumn[];
    unassigned: KanbanTask[];
}

/* ────────────────────────────────────────────
   Configuration
   ──────────────────────────────────────────── */

// Calls our own backend proxy — the API key never reaches the browser
const PROXY_URL = '/kanban-proxy/board';

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    todo: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' },
    in_progress: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
    completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    done: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    high: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
    medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    low: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

function formatDate(raw: string) {
    try {
        return new Date(raw).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
        return raw;
    }
}

function formatShortDate(raw: string) {
    try {
        return new Date(raw).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
        return raw;
    }
}

function timeAgo(raw: string) {
    try {
        const diff = Date.now() - new Date(raw).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    } catch {
        return raw;
    }
}

/* ────────────────────────────────────────────
   DEMO DATA (used when API is unreachable)
   ──────────────────────────────────────────── */

const DEMO_TASK: KanbanTask = {
    id: 101,
    title: 'Repair Unit #42',
    status: 'todo',
    priority: 'high',
    progress: 0,
    due_date: '2026-04-15',
    customer_name: 'Acme Corp',
    work_order_number: 'WO-2026-042',
    equipment: 'Hydraulic Pump',
    model_no: 'HP-3000X',
    serial_no: 'SN-98765',
    representative: 'John Smith',
    description:
        'Replace faulty valve assembly on hydraulic pump system. Initial diagnostic indicates leakage in the relief bypass. Valve received on-site. Field verification required before full teardown.',
    is_overdue: false,
    comments_count: 2,
    parts_count: 1,
    subtasks_count: 2,
    attachments_count: 1,
    assigned_to: {
        id: 5,
        name: 'Jane Doe',
        avatar: '',
    },
    comments: [
        {
            id: 201,
            comment: 'Valve received\n"Starting teardown tomorrow. Component looks clean."',
            user: { id: 5, name: 'Jane Doe' },
            attachment: null,
            attachment_type: null,
            created_at: '2026-03-25T09:15:00+00:00',
        },
        {
            id: 200,
            comment: 'Work Order Created',
            user: { id: 1, name: 'Admin System' },
            attachment: null,
            attachment_type: null,
            created_at: '2026-03-20T08:00:00+00:00',
        },
        {
            id: 200,
            comment: 'Work Order Created',
            user: { id: 1, name: 'Admin System' },
            attachment: null,
            attachment_type: null,
            created_at: '2026-03-20T08:00:00+00:00',
        },
        {
            id: 200,
            comment: 'Work Order Created',
            user: { id: 1, name: 'Admin System' },
            attachment: null,
            attachment_type: null,
            created_at: '2026-03-20T08:00:00+00:00',
        },
        {
            id: 200,
            comment: 'Work Order Created',
            user: { id: 1, name: 'Admin System' },
            attachment: null,
            attachment_type: null,
            created_at: '2026-03-20T08:00:00+00:00',
        },
        {
            id: 200,
            comment: 'Work Order Created',
            user: { id: 1, name: 'Admin System' },
            attachment: null,
            attachment_type: null,
            created_at: '2026-03-20T08:00:00+00:00',
        },
        {
            id: 200,
            comment: 'Work Order Created',
            user: { id: 1, name: 'Admin System' },
            attachment: null,
            attachment_type: null,
            created_at: '2026-03-20T08:00:00+00:00',
        },
        {
            id: 200,
            comment: 'Work Order Created',
            user: { id: 1, name: 'Admin System' },
            attachment: null,
            attachment_type: null,
            created_at: '2026-03-20T08:00:00+00:00',
        },
    ],
    parts: [
        {
            id: 301,
            part_name: 'Relief Valve Assembly',
            sku: 'RVA-4420',
            quantity: 1,
            unit: 'pc',
            status: 'ordered',
            supplier: 'Parker Hannifin',
            unit_price: '245.00',
            cost_of_parts: '245.00',
            eta_date: '2026-04-05',
            notes: 'Backordered, ETA confirmed',
        },
    ],
};

/* ────────────────────────────────────────────
   Component Props
   ──────────────────────────────────────────── */

interface WorkOrderModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workOrderNumber?: string;
}

/* ────────────────────────────────────────────
   Component
   ──────────────────────────────────────────── */

export default function WorkOrderModal({ open, onOpenChange, workOrderNumber }: WorkOrderModalProps) {
    const [task, setTask] = useState<KanbanTask | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [projectName, setProjectName] = useState('Brass Monkey');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(PROXY_URL, {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }

            const json = await response.json();
            const boardData: KanbanBoardData = json.data;
            setProjectName(boardData.project.name);

            // Find the matching task across all columns by work_order_number
            let matched: KanbanTask | null = null;
            for (const col of boardData.columns) {
                const found = col.tasks.find(
                    (t) =>
                        t.work_order_number === workOrderNumber ||
                        t.title.toLowerCase().includes(workOrderNumber?.toLowerCase() ?? '')
                );
                if (found) {
                    matched = found;
                    break;
                }
            }

            if (matched) {
                setTask(matched);
            } else {
                // Use demo data as fallback
                setTask(DEMO_TASK);
            }
        } catch {
            // If API is unavailable, show demo data
            setTask(DEMO_TASK);
            setError(null); // Don't show error — just use demo
        } finally {
            setLoading(false);
        }
    }, [workOrderNumber]);

    useEffect(() => {
        if (open) {
            fetchData();
        } else {
            setTask(null);
            setError(null);
        }
    }, [open, fetchData]);

    const statusStyle = STATUS_COLORS[task?.status ?? 'todo'] ?? STATUS_COLORS.todo;
    const priorityStyle = PRIORITY_COLORS[task?.priority ?? 'medium'] ?? PRIORITY_COLORS.medium;
    const statusLabel = (task?.status ?? 'todo').replace(/_/g, ' ').toUpperCase();
    const priorityLabel = (task?.priority ?? 'medium').toUpperCase();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="sm:max-w-4xl max-h-[90vh] bg-bm-dark  overflow-y-auto text-white p-0 rounded-2xl"
            >
                {/* Accessible title — visually hidden since we have a custom header */}
                <DialogTitle className="sr-only">
                    Work Order {task?.work_order_number ?? workOrderNumber}
                </DialogTitle>

                {loading ? (
                    /* ─── Loading State ─── */
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-[#d4a017]" />
                        <p className="text-sm text-[#a8a29e]">Loading work order data…</p>
                    </div>
                ) : error ? (
                    /* ─── Error State ─── */
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <AlertCircle className="h-10 w-10 text-red-400" />
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                ) : task ? (
                    <>
                        {/* ═══════════════ HEADER ═══════════════ */}
                        <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-white/5">
                            <div className="flex-1 min-w-0">
                                {/* WO badge + Title */}
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="shrink-0 rounded-md bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                                        {task.work_order_number}
                                    </span>
                                    <h2 className="font-serif text-xl font-bold text-white truncate">{task.title}</h2>
                                </div>
                                <p className="mt-1 text-xs text-[#a8a29e]">
                                    Project: <span className="text-white/80">{projectName}</span>
                                </p>
                            </div>

                            {/* Status + Priority + Close */}
                            <div className="flex items-center gap-2 shrink-0">
                                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyle.bg} ${statusStyle.text} border border-white/5`}>
                                    ● {statusLabel}
                                </span>
                                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${priorityStyle.bg} ${priorityStyle.text} border ${priorityStyle.border}`}>
                                    ! {priorityLabel} PRIORITY
                                </span>
                                <button
                                    onClick={() => onOpenChange(false)}
                                    className="ml-2 rounded-lg p-1.5 text-[#a8a29e] transition-colors hover:bg-white/10 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* ═══════════════ BODY — 2-column layout ═══════════════ */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                            {/* ─── LEFT COLUMN (3/5) ─── */}
                            <div className="lg:col-span-3 p-6 space-y-6 border-r border-white/5">
                                {/* Description */}
                                <div>
                                    <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a8a29e] mb-3">
                                        <FileText className="h-3.5 w-3.5" /> Description
                                    </h3>
                                    <p className="text-sm leading-relaxed text-[#d6d3d1]">{task.description}</p>
                                </div>

                                {/* Equipment Details */}
                                <div>
                                    <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a8a29e] mb-3">
                                        <Wrench className="h-3.5 w-3.5" /> Equipment Details
                                    </h3>
                                    <div className="rounded-xl border border-white/5 overflow-hidden">
                                        <table className="w-full text-xs">
                                            <tbody className="divide-y divide-white/5">
                                                <tr>
                                                    <td className="px-4 py-2.5 text-[#a8a29e] font-bold uppercase tracking-wider text-[10px] w-1/3">Equipment</td>
                                                    <td className="px-4 py-2.5 text-[#a8a29e] font-bold uppercase tracking-wider text-[10px] w-1/3">Model</td>
                                                    <td className="px-4 py-2.5 text-[#a8a29e] font-bold uppercase tracking-wider text-[10px] w-1/3">Serial No</td>
                                                </tr>
                                                <tr className="bg-white/2">
                                                    <td className="px-4 py-2.5 font-bold text-white">{task.equipment}</td>
                                                    <td className="px-4 py-2.5 font-bold text-white">{task.model_no}</td>
                                                    <td className="px-4 py-2.5 font-bold text-white">{task.serial_no}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2.5 text-[#a8a29e] font-bold uppercase tracking-wider text-[10px]">Customer</td>
                                                    <td className="px-4 py-2.5 text-[#a8a29e] font-bold uppercase tracking-wider text-[10px]">Representative</td>
                                                    <td className="px-4 py-2.5 text-[#a8a29e] font-bold uppercase tracking-wider text-[10px]">Due Date</td>
                                                </tr>
                                                <tr className="bg-white/2">
                                                    <td className="px-4 py-2.5 font-bold text-white">{task.customer_name}</td>
                                                    <td className="px-4 py-2.5 font-bold text-white">{task.representative}</td>
                                                    <td className="px-4 py-2.5 font-bold text-[#d4a017]">{formatDate(task.due_date)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Parts Table */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a8a29e]">
                                            <Package className="h-3.5 w-3.5" /> Parts Table
                                        </h3>
                                    </div>
                                    {task.parts.length > 0 ? (
                                        <div className="rounded-xl border border-white/5 overflow-hidden">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="text-left">
                                                        <th className="px-3 py-2.5 text-[#a8a29e] font-bold uppercase tracking-wider text-[10px]">Part Name</th>
                                                        <th className="px-3 py-2.5 text-[#a8a29e] font-bold uppercase tracking-wider text-[10px]">SKU</th>
                                                        <th className="px-3 py-2.5 text-[#a8a29e] font-bold uppercase tracking-wider text-[10px]">Qty</th>
                                                        <th className="px-3 py-2.5 text-[#a8a29e] font-bold uppercase tracking-wider text-[10px]">Status</th>
                                                        <th className="px-3 py-2.5 text-[#a8a29e] font-bold uppercase tracking-wider text-[10px]">Supplier</th>
                                                        <th className="px-3 py-2.5 text-[#a8a29e] font-bold uppercase tracking-wider text-[10px]">ETA</th>
                                                        <th className="px-3 py-2.5 text-[#a8a29e] font-bold uppercase tracking-wider text-[10px] text-right">Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {task.parts.map((part) => (
                                                        <tr key={part.id} className="bg-white/2 hover:bg-white/4 transition-colors">
                                                            <td className="px-3 py-2.5 font-bold text-white">{part.part_name}</td>
                                                            <td className="px-3 py-2.5 text-[#a8a29e]">{part.sku}</td>
                                                            <td className="px-3 py-2.5 text-white">{part.quantity} {part.unit}</td>
                                                            <td className="px-3 py-2.5">
                                                                <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                                                                    {part.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-2.5 text-[#d6d3d1]">{part.supplier}</td>
                                                            <td className="px-3 py-2.5 text-[#d6d3d1]">{formatShortDate(part.eta_date)}</td>
                                                            <td className="px-3 py-2.5 text-right font-bold text-[#d4a017]">${part.unit_price}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-white/10 py-6 text-center text-xs text-[#a8a29e]/50">
                                            No parts listed yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ─── RIGHT COLUMN (2/5) ─── */}
                            <div className="lg:col-span-2 p-6 space-y-6">
                                {/* Assigned Specialist */}
                                {task.assigned_to && (
                                    <div>
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a8a29e] mb-3">
                                            Assigned Specialist
                                        </h3>
                                        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/2 p-4">
                                            {task.assigned_to.avatar ? (
                                                <img
                                                    src={task.assigned_to.avatar}
                                                    alt={task.assigned_to.name}
                                                    className="h-10 w-10 rounded-full border-2 border-[#d4a017]/30 object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#d4a017]/30 bg-[#d4a017]/10 text-[#d4a017]">
                                                    <User className="h-5 w-5" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm text-white truncate">{task.assigned_to.name}</p>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#a8a29e]">
                                                    Specialist
                                                </p>
                                            </div>
                                            <button className="rounded-lg p-2 text-[#a8a29e] hover:bg-white/5 hover:text-[#d4a017] transition-colors">
                                                <Mail className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Captain's Log*/}
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a8a29e] mb-3">
                                        Captain's Log
                                    </h3>
                                    {task.comments.length > 0 ? (
                                        <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 scrollbar-premium">
                                            {task.comments.map((c) => (
                                                <div key={c.id} className="relative flex gap-3">
                                                    {/* Timeline dot */}
                                                    <div className="mt-1.5 shrink-0">
                                                        <div className="h-3 w-3 rounded-full border-2 border-[#d4a017]/40 bg-transparent" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className="text-sm font-bold text-white leading-tight whitespace-pre-wrap">
                                                                {c.comment}
                                                            </p>
                                                            <span className="shrink-0 text-[10px] text-[#a8a29e]">{formatShortDate(c.created_at)}</span>
                                                        </div>
                                                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#a8a29e]">
                                                            {c.user.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-white/10 py-6 text-center text-xs text-[#a8a29e]/50">
                                            No log entries yet.
                                        </div>
                                    )}
                                </div>

                                {/* Files */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a8a29e]">
                                            Files
                                        </h3>
                                        {task.attachments_count > 0 && (
                                            <span className="rounded-full bg-[#d4a017]/10 px-2 py-0.5 text-[10px] font-bold text-[#d4a017]">
                                                {task.attachments_count}
                                            </span>
                                        )}
                                    </div>
                                    {task.attachments_count > 0 ? (
                                        <div className="rounded-xl border border-white/5 bg-white/2 p-3 flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-white truncate">
                                                    {task.model_no}_Schematics.pdf
                                                </p>
                                                <p className="text-[10px] text-[#a8a29e]">2.4 MB</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-white/10 py-4 text-center text-xs text-[#a8a29e]/50">
                                            No files attached.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ═══════════════ FOOTER ═══════════════ */}
                        <div className="flex items-center justify-end gap-4 border-t border-white/5 px-6 py-4 bg-white/2">
                            <div className="flex items-center gap-2">
                                <button className="rounded-lg border border-white/10 bg-transparent px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#a8a29e] hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2">
                                    <Printer className="h-3.5 w-3.5" /> Print Worksheet
                                </button>
                            </div>
                        </div>
                    </>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
