import { Head, Link, useForm } from '@inertiajs/react';
import {
    Search,
    Package,
    CheckCircle2,
    ShieldCheck,
    Clock,
    Wrench,
    Truck,
    ArrowLeft,
    ChevronRight,
    AlertCircle,
    User,
    Calendar,
    ArrowRight,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { home, login } from '@/routes';

interface ServiceOrder {
    tracking_number: string;
    customer_name: string;
    service_type: string;
    status: 'pending' | 'in-progress' | 'completed' | 'ready';
    description: string;
    estimated_completion: string;
    notes?: { id: number; type: string; content: string; created_at: string }[];
}

interface Props {
    order?: ServiceOrder;
    query?: string;
}

const STATUS_CONFIG = {
    pending: { label: 'Order Received', color: 'text-blue-400', bg: 'bg-blue-400/10', bar: 'bg-blue-400' },
    'in-progress': { label: 'In Progress', color: 'text-bm-gold', bg: 'bg-bm-gold/10', bar: 'bg-bm-gold' },
    completed: { label: 'Quality Check', color: 'text-emerald-400', bg: 'bg-emerald-400/10', bar: 'bg-emerald-400' },
    ready: { label: 'Ready for Pickup', color: 'text-emerald-400', bg: 'bg-emerald-400/10', bar: 'bg-emerald-400' },
};

export default function TrackOrder({ order, query }: Props) {
    const { data, setData, get, processing } = useForm({
        number: query || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        get('/track-order');
    };

    const statusSteps = [
        { key: 'pending', label: 'Order Received', sub: 'Your service request has been logged', icon: Package },
        { key: 'diagnostic', label: 'Diagnostics', sub: 'Performing detailed assessment', icon: Search },
        { key: 'in-progress', label: 'In Progress', sub: 'Technicians are working on your unit', icon: Wrench },
        { key: 'completed', label: 'Quality Check', sub: 'Triple-point quality verification', icon: CheckCircle2 },
        { key: 'ready', label: 'Ready for Pickup', sub: 'Your service is complete', icon: Truck },
    ];

    const currentStatusIndex = Math.max(statusSteps.findIndex((s) => s.key === order?.status), 0);
    const progressPercent = (currentStatusIndex / (statusSteps.length - 1)) * 100;
    const statusCfg = order ? (STATUS_CONFIG[order.status] ?? STATUS_CONFIG['in-progress']) : null;
    const latestNote = order?.notes?.[0];

    return (
        <div className="min-h-screen bg-bm-dark text-bm-white selection:bg-bm-gold/30 relative overflow-hidden">
            <Head title="Track Your Order | Brassmonkey" />

            {/* Decorative background layers */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-bm-gold/5 blur-[120px]" />
                <div className="absolute top-1/2 -right-60 h-[500px] w-[500px] rounded-full bg-bm-gold/3 blur-[100px]" />
                <div className="absolute -bottom-40 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-bm-gold/4 blur-[120px]" />
                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            {/* Full-width sticky header */}
            <header className="relative z-20 border-b border-bm-white/5 bg-bm-dark/80 backdrop-blur-xl">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
                    <Link href={home()} className="flex items-center gap-3 transition-opacity hover:opacity-80">
                        <AppLogoIcon className="h-10 w-auto" />
                        <div>
                            <span className="block font-serif text-xl font-bold leading-tight tracking-tight">Brassmonkey</span>
                            <span className="block text-[9px] font-bold uppercase tracking-[0.25em] text-bm-gold/60">Mechanical Mastery</span>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-6">
                        <Link
                            href={home()}
                            className="hidden text-[12px] font-bold uppercase tracking-widest text-bm-muted transition-colors hover:text-bm-white sm:block"
                        >
                            ← Back to Home
                        </Link>
                        <Link
                            href={login()}
                            className="rounded-lg border border-bm-white/10 bg-bm-white/5 px-5 py-2.5 text-[12px] font-bold uppercase tracking-widest text-bm-white transition-all hover:bg-bm-white/10"
                        >
                            Sign In
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
                {/* Page title */}
                <div className="mb-16 text-center">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-bm-gold/20 bg-bm-gold/5 px-5 py-2 backdrop-blur-sm">
                        <Truck className="h-3.5 w-3.5 text-bm-gold" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-bm-gold">Live Service Tracking</span>
                    </div>
                    <h1 className="font-serif text-5xl font-bold tracking-tight lg:text-6xl">
                        Track Your <span className="text-bm-gold">Service</span>
                    </h1>
                    <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-bm-muted">
                        Enter your unique tracking ID for real-time updates on your mechanical service status.
                    </p>
                </div>

                {/* Search form — full width, prominent */}
                <div className="mx-auto mb-16 max-w-2xl">
                    <div className="rounded-2xl border border-bm-white/10 bg-bm-white/[0.03] p-2 shadow-2xl backdrop-blur-xl">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-bm-muted" />
                                <Input
                                    value={data.number}
                                    onChange={(e) => setData('number', e.target.value.toUpperCase())}
                                    placeholder="e.g. BM-1001"
                                    className="h-16 rounded-xl border-transparent bg-transparent pl-14 pr-6 text-lg font-bold uppercase tracking-widest text-bm-white placeholder:text-bm-muted/30 focus:border-bm-gold/30 focus:ring-bm-gold/20"
                                    required
                                />
                            </div>
                            <Button
                                disabled={processing}
                                type="submit"
                                className="h-16 rounded-xl bg-bm-gold px-8 text-sm font-bold uppercase tracking-widest text-bm-dark shadow-lg shadow-bm-gold/20 transition-all hover:scale-105 hover:bg-bm-gold-hover active:scale-95"
                            >
                                Track Now <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                    <p className="mt-4 text-center text-[11px] font-bold uppercase tracking-[0.3em] text-bm-muted/40">
                        Sample IDs: BM-1001 · BM-1002 · BM-1003
                    </p>
                </div>

                {/* ─── Results ─── */}
                {order ? (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        {/* Status Banner */}
                        <div className="mb-10 overflow-hidden rounded-2xl border border-bm-white/10 bg-bm-white/[0.03] backdrop-blur-xl">
                            <div className="flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center">
                                {/* Left: ID + customer */}
                                <div className="flex items-center gap-6">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-bm-gold/10 text-bm-gold shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                                        <Package className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-bm-muted">Tracking Number</p>
                                        <h2 className="font-serif text-3xl font-bold tracking-tight">{order.tracking_number}</h2>
                                        <p className="mt-1 flex items-center gap-2 text-sm text-bm-muted">
                                            <User className="h-3.5 w-3.5" /> {order.customer_name}
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Status pill + date */}
                                <div className="flex flex-col items-end gap-3">
                                    <div className={`flex items-center gap-2 rounded-full px-5 py-2.5 ${statusCfg?.bg}`}>
                                        <span className={`h-2 w-2 animate-pulse rounded-full ${statusCfg?.bar}`} />
                                        <span className={`text-[11px] font-bold uppercase tracking-[0.15em] ${statusCfg?.color}`}>
                                            {statusCfg?.label}
                                        </span>
                                    </div>
                                    <p className="flex items-center gap-2 text-sm text-bm-muted">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>Est. Ready: </span>
                                        <span className="font-bold text-bm-white">{order.estimated_completion}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="h-1 bg-bm-white/5">
                                <div
                                    className="h-full bg-bm-gold transition-all duration-1000 ease-out"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>

                        {/* Main grid: Timeline | Service Details */}
                        <div className="grid gap-8 lg:grid-cols-5">
                            {/* ─── Vertical Status Timeline ─── */}
                            <div className="lg:col-span-3">
                                <div className="rounded-2xl border border-bm-white/10 bg-bm-white/[0.03] p-8 backdrop-blur-xl">
                                    <h3 className="mb-8 text-[11px] font-bold uppercase tracking-[0.2em] text-bm-muted">Service Journey</h3>

                                    <div className="relative ml-5 space-y-0">
                                        {statusSteps.map((step, i) => {
                                            const isDone = i < currentStatusIndex;
                                            const isActive = i === currentStatusIndex;
                                            const isPending = i > currentStatusIndex;
                                            const isLast = i === statusSteps.length - 1;

                                            return (
                                                <div key={step.key} className="relative flex gap-6">
                                                    {/* Vertical connector line */}
                                                    {!isLast && (
                                                        <div
                                                            className={`absolute left-[19px] top-[40px] h-full w-[2px] ${isDone ? 'bg-bm-gold' : 'bg-bm-white/10'}`}
                                                        />
                                                    )}

                                                    {/* Step icon */}
                                                    <div className="relative shrink-0">
                                                        <div
                                                            className={`
                                                                flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500
                                                                ${isDone ? 'border-bm-gold bg-bm-gold text-bm-dark' : ''}
                                                                ${isActive ? 'border-bm-gold bg-bm-gold/10 text-bm-gold shadow-[0_0_24px_rgba(212,160,23,0.3)]' : ''}
                                                                ${isPending ? 'border-bm-white/10 bg-transparent text-bm-muted/30' : ''}
                                                            `}
                                                        >
                                                            {isDone ? (
                                                                <CheckCircle2 className="h-5 w-5" />
                                                            ) : (
                                                                <step.icon className="h-4 w-4" />
                                                            )}
                                                        </div>
                                                        {isActive && (
                                                            <span className="absolute inset-0 animate-ping rounded-full border-2 border-bm-gold/40" />
                                                        )}
                                                    </div>

                                                    {/* Step text */}
                                                    <div className={`pb-10 ${isLast ? 'pb-0' : ''}`}>
                                                        <p
                                                            className={`text-sm font-bold uppercase tracking-wider transition-colors ${isDone || isActive ? 'text-bm-white' : 'text-bm-muted/30'
                                                                }`}
                                                        >
                                                            {step.label}
                                                        </p>
                                                        <p
                                                            className={`mt-1 text-xs leading-relaxed ${isActive ? 'text-bm-muted' : 'text-bm-muted/30'
                                                                }`}
                                                        >
                                                            {step.sub}
                                                        </p>
                                                        {isActive && (
                                                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-bm-gold/10 px-3 py-1">
                                                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bm-gold" />
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-bm-gold">
                                                                    Current Stage
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* ─── Right Panel: Details + Update ─── */}
                            <div className="flex flex-col gap-8 lg:col-span-2">
                                {/* Service Info */}
                                <div className="rounded-2xl border border-bm-white/10 bg-bm-white/[0.03] p-8 backdrop-blur-xl">
                                    <h3 className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-bm-muted">Service Details</h3>
                                    <div className="mb-5 flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bm-gold/10 text-bm-gold">
                                            <Wrench className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-bm-muted">Service Type</p>
                                            <p className="text-lg font-bold">{order.service_type}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm leading-relaxed text-bm-muted">{order.description}</p>
                                </div>

                                {/* Latest Update */}
                                <div className="rounded-2xl border border-bm-white/10 bg-bm-white/[0.03] p-8 backdrop-blur-xl">
                                    <h3 className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-bm-muted">Latest Update</h3>
                                    {latestNote ? (
                                        <div className="flex gap-4">
                                            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bm-gold/10 text-bm-gold">
                                                <Clock className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold capitalize">{latestNote.type.replace('_', ' ')}</p>
                                                <p className="mt-2 text-xs leading-relaxed text-bm-muted whitespace-pre-wrap">
                                                    {latestNote.content}
                                                </p>
                                                <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-bm-muted/40">
                                                    {new Date(latestNote.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-bm-muted/50 py-4 text-center border border-dashed border-bm-white/10 rounded-xl">No updates posted yet.</div>
                                    )}
                                </div>

                                {/* Need Help */}
                                <div className="rounded-2xl border border-bm-white/10 bg-bm-white/[0.03] p-6 backdrop-blur-xl">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="h-5 w-5 shrink-0 text-bm-gold" />
                                        <p className="text-sm text-bm-muted">
                                            Questions?{' '}
                                            <Link href="#" className="font-bold text-bm-white transition-colors hover:text-bm-gold">
                                                Contact our support desk →
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : query ? (
                    /* ─── Not Found ─── */
                    <div className="mx-auto max-w-lg">
                        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-16 text-center backdrop-blur-xl">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                                <AlertCircle className="h-10 w-10" />
                            </div>
                            <h2 className="font-serif text-2xl font-bold">Order Not Found</h2>
                            <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-bm-muted">
                                No record found for <span className="font-bold text-bm-white">"{query}"</span>. Double-check your tracking ID and try again.
                            </p>
                            <Button
                                onClick={() => setData('number', '')}
                                variant="outline"
                                className="mt-8 border-bm-white/20 bg-transparent text-bm-white hover:bg-bm-white/10"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" /> Try Again
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* ─── Default info cards ─── */
                    <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
                        <div className="group rounded-2xl border border-bm-white/10 bg-bm-white/[0.03] p-8 backdrop-blur-xl transition-all hover:border-bm-gold/20 hover:bg-bm-gold/5">
                            <Wrench className="mb-5 h-8 w-8 text-bm-gold" />
                            <h3 className="mb-2 text-lg font-bold">Lost Your Tracking ID?</h3>
                            <p className="mb-6 text-sm leading-relaxed text-bm-muted">
                                Contact our support desk with your registered email and we'll locate your order instantly.
                            </p>
                            <Link href="#" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-bm-gold transition-all group-hover:gap-2">
                                Contact Support <ChevronRight className="ml-1 h-3 w-3" />
                            </Link>
                        </div>
                        <div className="group rounded-2xl border border-bm-white/10 bg-bm-white/[0.03] p-8 backdrop-blur-xl transition-all hover:border-bm-gold/20 hover:bg-bm-gold/5">
                            <ShieldCheck className="mb-5 h-8 w-8 text-bm-gold" />
                            <h3 className="mb-2 text-lg font-bold">Triple-Point Verification</h3>
                            <p className="mb-6 text-sm leading-relaxed text-bm-muted">
                                Every Brassmonkey service order undergoes three quality checkpoints before being marked ready.
                            </p>
                            <Link href="#about" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-bm-gold transition-all group-hover:gap-2">
                                Learn More <ChevronRight className="ml-1 h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                )}
            </main>

            <footer className="relative z-10 border-t border-bm-white/5 py-10 text-center text-[11px] font-bold uppercase tracking-[0.3em] text-bm-muted/40">
                © {new Date().getFullYear()} Brassmonkey Mechanical Mastery
            </footer>
        </div>
    );
}
