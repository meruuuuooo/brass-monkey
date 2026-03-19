import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { login } from '@/routes';
import AppLogoIcon from '@/components/app-logo-icon';
import {
    PenTool as Repair,
    ShieldCheck,
    Cpu,
    Gauge,
    CheckCircle2,
    Star,
    ArrowRight,
    Mail,
    Phone,
    MapPin,
    Search,
    ChevronRight,
    Settings,
    Wrench,
    Package,
    Truck,
    User,
    Calendar,
    AlertCircle,
    Clock,
    ArrowUp,
    Instagram,
    Twitter,
    Linkedin,
    Facebook,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ServiceOrder {
    tracking_number: string;
    customer_name: string;
    service_type: string;
    status: 'pending' | 'in-progress' | 'completed' | 'ready';
    description: string;
    estimated_completion: string;
}

interface Props {
    canRegister?: boolean;
    auth?: { user: any };
    order?: ServiceOrder;
    query?: string;
}

const STATUS_CONFIG = {
    pending: { label: 'Order Received', color: 'text-blue-400', bg: 'bg-blue-400/10', bar: 'bg-blue-400' },
    'in-progress': { label: 'In Progress', color: 'text-bm-gold', bg: 'bg-bm-gold/10', bar: 'bg-bm-gold' },
    completed: { label: 'Quality Check', color: 'text-emerald-400', bg: 'bg-emerald-400/10', bar: 'bg-emerald-400' },
    ready: { label: 'Ready for Pickup', color: 'text-emerald-400', bg: 'bg-emerald-400/10', bar: 'bg-emerald-400' },
} as const;

const statusSteps = [
    { key: 'pending', label: 'Order Received', sub: 'Your service request has been logged', icon: Package },
    { key: 'diagnostic', label: 'Diagnostics', sub: 'Performing detailed assessment', icon: Search },
    { key: 'in-progress', label: 'In Progress', sub: 'Technicians are working on your unit', icon: Wrench },
    { key: 'completed', label: 'Quality Check', sub: 'Triple-point quality verification', icon: CheckCircle2 },
    { key: 'ready', label: 'Ready for Pickup', sub: 'Your service is complete', icon: Truck },
];

export default function Welcome({ canRegister = true, auth, order, query }: Props) {
    const currentStatusIndex = Math.max(statusSteps.findIndex((s) => s.key === order?.status), 0);
    const progressPercent = order ? (currentStatusIndex / (statusSteps.length - 1)) * 100 : 0;
    const statusCfg = order ? (STATUS_CONFIG[order.status] ?? STATUS_CONFIG['in-progress']) : null;

    const { data, setData, get, processing } = useForm({ number: query ?? '' });

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        get('/', { preserveScroll: false });
    };

    // Auto-scroll to results when an order is returned
    useEffect(() => {
        if (order) {
            document.getElementById('track-order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [order?.tracking_number]);

    const formatDate = (raw: string) => {
        try { return new Date(raw).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
        catch { return raw; }
    };

    // Back to Top Logic
    const [showBackToTop, setShowBackToTop] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 500);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id.replace('#', ''));
        if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            window.history.pushState(null, '', id);
        }
    };
    return (
        <div className="min-h-screen bg-bm-dark text-bm-white selection:bg-bm-gold/30 selection:text-bm-white">
            <Head title="Brassmonkey | Precision Mechanical Excellence" />

            {/* Navigation */}
            <header className="fixed top-0 z-50 w-full border-b border-bm-border/10 bg-bm-dark/80 backdrop-blur-md">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3 group">
                            <AppLogoIcon className="h-10 w-auto transition-transform duration-300 group-hover:scale-110" />
                            <span className="font-serif text-xl font-bold tracking-tight text-bm-white">Brass Monkey</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-8">
                        <nav className="hidden items-center gap-6 lg:flex">
                            {[
                                { name: 'Track Order', href: '#track-order' },
                                { name: 'Services', href: '#services' },
                                { name: 'Blogs', href: '#blogs' },
                                { name: 'About', href: '#about' },
                                { name: 'Product', href: '#product' }
                            ].map((item) => (
                                <a 
                                    key={item.name} 
                                    href={item.href} 
                                    onClick={(e) => handleScrollToSection(e, item.href)}
                                    className="text-[13px] font-bold text-bm-muted transition-colors hover:text-bm-gold uppercase tracking-wider cursor-pointer"
                                >
                                    {item.name}
                                </a>
                            ))}
                        </nav>

                        <div className="flex items-center gap-6 border-l border-bm-white/10 pl-8">
                            <Link 
                                href={login()} 
                                className="text-[13px] font-bold text-bm-white transition-colors hover:text-bm-gold uppercase tracking-wider"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
                    <div className="absolute inset-0 z-0 opacity-40">
                        <img 
                            src="/images/landing/hero-gears.png" 
                            alt="Mechanical Gears" 
                            className="h-full w-full object-cover scale-110 animate-pulse duration-[8000ms]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-bm-dark via-bm-dark/60 to-bm-dark" />
                    </div>

                    <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-8 mt-16">
                        <div className="mb-6 inline-flex items-center rounded-full border border-bm-gold/30 bg-bm-gold/5 px-4 py-1.5 backdrop-blur-sm">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-bm-gold">Premium Service Excellence</span>
                        </div>
                        
                        <h1 className="font-serif text-5xl font-bold leading-[1.1] tracking-tight sm:text-7xl lg:text-8xl">
                            Precision. <br />
                            Craftsmanship. <br />
                            <span className="text-bm-gold underline decoration-bm-gold/20 underline-offset-8">Performance.</span>
                        </h1>
                        
                        <p className="mx-auto mt-10 max-w-2xl text-lg font-medium leading-relaxed text-bm-muted/90">
                            Premium technical maintenance and artisanal mechanical services for those who demand excellence. Where precision engineering meets uncompromising craftsmanship.
                        </p>

                        <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
                            <Button size="lg" className="bg-bm-gold px-10 h-14 text-bm-dark font-bold hover:bg-bm-gold-hover transition-all hover:scale-105 active:scale-95 shadow-xl shadow-bm-gold/20 rounded-lg group">
                                Book a Service <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                            <Button variant="outline" size="lg" className="border-bm-white/30 bg-transparent px-10 h-14 text-bm-white font-bold hover:bg-bm-white/10 transition-all rounded-lg backdrop-blur-sm">
                                Explore Services
                            </Button>
                        </div>

                        {/* Scroll-down cue */}
                        <div className="mt-16 animate-bounce">
                            <a href="#track-order" className="inline-flex flex-col items-center gap-2 text-bm-muted/40 transition-colors hover:text-bm-gold">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Track Your Order</span>
                                <ChevronRight className="h-4 w-4 rotate-90" />
                            </a>
                        </div>
                    </div>
                </section>
                {/* ──────────────── TRACK ORDER SECTION ──────────────── */}
                <section id="track-order" className="relative overflow-hidden bg-bm-dark py-32">
                    {/* Background glow */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-bm-gold/5 blur-[120px]" />
                    </div>

                    <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                        {/* Section header */}
                        <div className="mb-16 text-center">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-bm-gold/20 bg-bm-gold/5 px-5 py-2 backdrop-blur-sm">
                                <Truck className="h-3.5 w-3.5 text-bm-gold" />
                                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-bm-gold">Live Service Tracking</span>
                            </div>
                            <h2 className="font-serif text-4xl font-bold tracking-tight lg:text-5xl">
                                Track Your <span className="text-bm-gold">Service Order</span>
                            </h2>
                            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-bm-muted">
                                Enter your unique tracking ID below for real-time updates on your mechanical service status.
                            </p>
                        </div>

                        {/* Search form */}
                        <div className="mx-auto mb-12 max-w-2xl">
                            <div className="rounded-2xl border border-bm-white/10 bg-bm-white/[0.03] p-2 shadow-2xl backdrop-blur-xl">
                                <form onSubmit={handleTrack} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-bm-muted" />
                                        <input
                                            name="number"
                                            type="text"
                                            value={data.number}
                                            onChange={(e) => setData('number', e.target.value.toUpperCase())}
                                            placeholder="e.g. BM-1001"
                                            className="h-16 w-full rounded-xl bg-transparent pl-14 pr-6 text-lg font-bold uppercase tracking-widest text-bm-white placeholder:text-bm-muted/30 focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="h-16 rounded-xl bg-bm-gold px-8 text-sm font-bold uppercase tracking-widest text-bm-dark shadow-lg shadow-bm-gold/20 transition-all hover:scale-105 hover:bg-bm-gold-hover active:scale-95 disabled:opacity-60"
                                    >
                                        Track Now <ArrowRight className="ml-2 inline h-4 w-4" />
                                    </button>
                                </form>
                            </div>
                            <p className="mt-4 text-center text-[11px] font-bold uppercase tracking-[0.3em] text-bm-muted/40">
                                Sample IDs: BM-1001 · BM-1002 · BM-1003
                            </p>
                        </div>

                        {/* Results */}
                        {order ? (
                            <div className="animate-in fade-in zoom-in-95 duration-500">
                                {/* Status banner */}
                                <div className="mb-10 overflow-hidden rounded-2xl border border-bm-white/10 bg-bm-white/[0.03] backdrop-blur-xl">
                                    <div className="flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center">
                                        <div className="flex items-center gap-6">
                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-bm-gold/10 text-bm-gold">
                                                <Package className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-bm-muted">Tracking Number</p>
                                                <h3 className="font-serif text-3xl font-bold tracking-tight">{order.tracking_number}</h3>
                                                <p className="mt-1 flex items-center gap-2 text-sm text-bm-muted">
                                                    <User className="h-3.5 w-3.5" /> {order.customer_name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-3">
                                            <div className={`flex items-center gap-2 rounded-full px-5 py-2.5 ${statusCfg?.bg}`}>
                                                <span className={`h-2 w-2 animate-pulse rounded-full ${statusCfg?.bar}`} />
                                                <span className={`text-[11px] font-bold uppercase tracking-[0.15em] ${statusCfg?.color}`}>
                                                    {statusCfg?.label}
                                                </span>
                                            </div>
                                            <p className="flex items-center gap-2 text-sm text-bm-muted">
                                                <Calendar className="h-3.5 w-3.5" />
                                                Est. Ready: <span className="font-bold text-bm-white">{formatDate(order.estimated_completion)}</span>
                                            </p>
                                        </div>
                                    </div>
                                    {/* Gold progress bar */}
                                    <div className="h-1 bg-bm-white/5">
                                        <div
                                            className="h-full bg-bm-gold transition-all duration-1000 ease-out"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Grid: Timeline | Details */}
                                <div className="grid gap-8 lg:grid-cols-5">
                                    {/* Vertical Timeline */}
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
                                                            {!isLast && (
                                                                <div className={`absolute left-[19px] top-[40px] h-full w-[2px] ${isDone ? 'bg-bm-gold' : 'bg-bm-white/10'}`} />
                                                            )}
                                                            <div className="relative shrink-0">
                                                                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 ${isDone ? 'border-bm-gold bg-bm-gold text-bm-dark' : ''} ${isActive ? 'border-bm-gold bg-bm-gold/10 text-bm-gold shadow-[0_0_24px_rgba(212,160,23,0.3)]' : ''} ${isPending ? 'border-bm-white/10 bg-transparent text-bm-muted/30' : ''}`}>
                                                                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : <step.icon className="h-4 w-4" />}
                                                                </div>
                                                                {isActive && <span className="absolute inset-0 animate-ping rounded-full border-2 border-bm-gold/40" />}
                                                            </div>
                                                            <div className={`pb-10 ${isLast ? 'pb-0' : ''}`}>
                                                                <p className={`text-sm font-bold uppercase tracking-wider transition-colors ${isDone || isActive ? 'text-bm-white' : 'text-bm-muted/30'}`}>
                                                                    {step.label}
                                                                </p>
                                                                <p className={`mt-1 text-xs leading-relaxed ${isActive ? 'text-bm-muted' : 'text-bm-muted/30'}`}>
                                                                    {step.sub}
                                                                </p>
                                                                {isActive && (
                                                                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-bm-gold/10 px-3 py-1">
                                                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bm-gold" />
                                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-bm-gold">Current Stage</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right panel */}
                                    <div className="flex flex-col gap-8 lg:col-span-2">
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

                                        <div className="rounded-2xl border border-bm-white/10 bg-bm-white/[0.03] p-8 backdrop-blur-xl">
                                            <h3 className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-bm-muted">Latest Update</h3>
                                            <div className="flex gap-4">
                                                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bm-gold/10 text-bm-gold">
                                                    <Clock className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">Technician Note</p>
                                                    <p className="mt-2 text-xs leading-relaxed text-bm-muted">
                                                        Alignment diagnostics complete. Calibration sequence initiated — final balancing in progress.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-bm-white/10 bg-bm-white/[0.03] p-6 backdrop-blur-xl">
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck className="h-5 w-5 shrink-0 text-bm-gold" />
                                                <p className="text-sm text-bm-muted">
                                                    Questions?{' '}
                                                    <a href="#" className="font-bold text-bm-white transition-colors hover:text-bm-gold">
                                                        Contact support →
                                                    </a>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : query ? (
                            /* Not found */
                            <div className="mx-auto max-w-lg">
                                <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-16 text-center backdrop-blur-xl">
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                                        <AlertCircle className="h-10 w-10" />
                                    </div>
                                    <h3 className="font-serif text-2xl font-bold">Order Not Found</h3>
                                    <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-bm-muted">
                                        No record found for <span className="font-bold text-bm-white">"{query}"</span>. Double-check your tracking ID and try again.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Default: info cards */
                            <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
                                <div className="group rounded-2xl border border-bm-white/10 bg-bm-white/[0.03] p-8 backdrop-blur-xl transition-all hover:border-bm-gold/20 hover:bg-bm-gold/5">
                                    <Wrench className="mb-5 h-8 w-8 text-bm-gold" />
                                    <h3 className="mb-2 text-lg font-bold">Lost Your Tracking ID?</h3>
                                    <p className="mb-6 text-sm leading-relaxed text-bm-muted">
                                        Contact our support desk with your registered email and we'll locate your order instantly.
                                    </p>
                                    <a href="#" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-bm-gold">
                                        Contact Support <ChevronRight className="ml-1 h-3 w-3" />
                                    </a>
                                </div>
                                <div className="group rounded-2xl border border-bm-white/10 bg-bm-white/[0.03] p-8 backdrop-blur-xl transition-all hover:border-bm-gold/20 hover:bg-bm-gold/5">
                                    <ShieldCheck className="mb-5 h-8 w-8 text-bm-gold" />
                                    <h3 className="mb-2 text-lg font-bold">Triple-Point Verification</h3>
                                    <p className="mb-6 text-sm leading-relaxed text-bm-muted">
                                        Every Brassmonkey service order undergoes three quality checkpoints before being marked ready.
                                    </p>
                                    <a href="#about" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-bm-gold">
                                        Learn More <ChevronRight className="ml-1 h-3 w-3" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* About Us Section */}
                <section id="about" className="bg-bm-cream py-32 text-bm-dark overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-bm-gold/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid items-center gap-16 lg:grid-cols-2">
                            <div className="relative">
                                <div className="mb-6 inline-block rounded-md bg-bm-gold/20 px-4 py-1.5">
                                    <span className="text-xs font-bold uppercase tracking-wider text-bm-dark/80">About Us</span>
                                </div>
                                <h2 className="font-serif text-4xl font-bold tracking-tight sm:text-6xl text-bm-dark leading-tight">
                                    Masters of Mechanical Excellence
                                </h2>
                                <p className="mt-8 text-lg font-medium leading-relaxed text-bm-dark/70">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                </p>
                                <p className="mt-6 text-lg font-medium leading-relaxed text-bm-dark/70">
                                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                </p>
                                
                                <div className="mt-12 grid grid-cols-2 gap-8 border-t border-bm-dark/10 pt-10">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-full bg-bm-gold/20 p-2 group shadow-sm">
                                            <CheckCircle2 className="h-5 w-5 text-bm-dark" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-bm-dark">15+ Years Experience</h4>
                                            <p className="text-sm text-bm-dark/60 font-medium mt-1">Proven track record</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-full bg-bm-gold/20 p-2 group shadow-sm">
                                            <ShieldCheck className="h-5 w-5 text-bm-dark" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-bm-dark">Certified Experts</h4>
                                            <p className="text-sm text-bm-dark/60 font-medium mt-1">Master technicians</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="relative group lg:mt-0 mt-12">
                                <div className="absolute inset-0 -rotate-3 scale-105 rounded-3xl bg-bm-gold/20 blur-2xl opacity-50 transition-transform group-hover:rotate-0" />
                                <img 
                                    src="/images/landing/about-tools.png"
                                    alt="Mechanical Tools"
                                    className="relative rounded-3xl shadow-2xl object-cover h-[500px] w-full border border-bm-dark/5"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Section */}
                <section id="services" className="bg-bm-dark py-32 relative overflow-hidden">
                    <div className="absolute top-1/2 left-0 w-96 h-96 bg-bm-gold/[0.03] blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2" />
                    
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="text-center">
                            <div className="mb-6 inline-block rounded-full border border-bm-gold/20 bg-bm-gold/5 px-4 py-1.5 backdrop-blur-sm">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-bm-gold">Our Services</span>
                            </div>
                            <h2 className="font-serif text-4xl font-bold tracking-tight text-bm-white sm:text-5xl">
                                Comprehensive Mechanical Solutions
                            </h2>
                            <p className="mx-auto mt-6 max-w-2xl text-lg text-bm-muted/80 font-medium">
                                From diagnostics to restoration, we offer a full spectrum of premium services tailored to your needs.
                            </p>
                        </div>

                        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { title: 'Diagnostic & Inspection', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.', icon: Search },
                                { title: 'Mechanical Restoration', desc: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.', icon: Repair },
                                { title: 'Preventive Maintenance', desc: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', icon: ShieldCheck },
                                { title: 'Performance Optimization', desc: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est.', icon: Gauge }
                            ].map((service, i) => (
                                <div key={i} className="bm-glass-premium bm-shadow-premium rounded-2xl p-8 hover:bg-bm-gold/[0.05] transition-all duration-300 group">
                                    <div className="mb-6 inline-flex rounded-xl bg-bm-gold/10 p-3 text-bm-gold transition-colors group-hover:bg-bm-gold group-hover:text-bm-dark">
                                        <service.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-bm-white group-hover:text-bm-gold transition-colors">{service.title}</h3>
                                    <p className="mt-4 text-sm leading-relaxed text-bm-muted group-hover:text-bm-white/90 transition-colors">
                                        {service.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="bg-bm-dark/50 py-32 border-y border-bm-border/5">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="text-center mb-20 text-balance">
                             <div className="mb-6 inline-block rounded-full border border-bm-gold/20 bg-bm-gold/5 px-4 py-1.5 backdrop-blur-sm">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-bm-gold">Why Brass Monkey</span>
                            </div>
                            <h2 className="font-serif text-4xl font-bold tracking-tight text-bm-white sm:text-5xl">
                                Unmatched Excellence in Every Detail
                            </h2>
                        </div>
                        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { title: 'Skilled Technicians', desc: 'Master craftsmen with decades of combined experience.', icon: Wrench },
                                { title: 'Precision Workmanship', desc: 'Meticulous attention to detail in every project.', icon: Gauge },
                                { title: 'High-Quality Tools', desc: 'State-of-the-art equipment for superior results.', icon: Settings },
                                { title: 'Reliable Results', desc: 'Consistent excellence backed by our guarantee.', icon: CheckCircle2 }
                            ].map((feature, i) => (
                                <div key={i} className="text-center group">
                                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-bm-gold/10 text-bm-gold group-hover:bg-bm-gold group-hover:text-bm-dark transition-all duration-300 ring-4 ring-bm-gold/5">
                                        <feature.icon className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-bm-white">{feature.title}</h3>
                                    <p className="mt-4 text-sm font-medium text-bm-muted/70 leading-relaxed px-4">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section id="testimonials" className="bg-bm-cream py-32 text-bm-dark relative overflow-hidden">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                         <div className="text-center mb-20">
                             <div className="mb-6 inline-block rounded-md bg-bm-gold/20 px-4 py-1.5">
                                <span className="text-xs font-bold uppercase tracking-wider text-bm-dark/80">Testimonials</span>
                            </div>
                            <h2 className="font-serif text-4xl font-bold tracking-tight text-bm-dark sm:text-5xl">
                                Trusted by Industry Leaders
                            </h2>
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                { 
                                    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", 
                                    author: "Marcus Rivera", 
                                    role: "Manufacturing Director" 
                                },
                                { 
                                    text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.", 
                                    author: "Sarah Chen", 
                                    role: "Operations Manager" 
                                },
                                { 
                                    text: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis.", 
                                    author: "David Thompson", 
                                    role: "Fleet Supervisor" 
                                }
                            ].map((tm, i) => (
                                <div key={i} className="bg-white/50 backdrop-blur-sm rounded-2xl p-10 border border-bm-dark/5 shadow-xl hover:shadow-2xl transition-shadow group flex flex-col h-full">
                                    <div className="mb-6 flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 fill-bm-gold text-bm-gold" />
                                        ))}
                                    </div>
                                    <p className="text-lg italic font-medium text-bm-dark/80 flex-grow">
                                        "{tm.text}"
                                    </p>
                                    <div className="mt-8 border-t border-bm-dark/10 pt-6">
                                        <h4 className="font-bold text-bm-dark">{tm.author}</h4>
                                        <p className="text-sm text-bm-dark/60 font-medium">{tm.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="relative overflow-hidden py-32 -mb-2">
                    <div className="absolute inset-0 z-0">
                         {/* Fallback pattern since quota was hit */}
                        <div className="absolute inset-x-0 bottom-0 z-10 leading-none pointer-events-none opacity-20 rotate-180 mb-[-1px]">
                            <svg className="relative block h-[120px] w-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
                                <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,103.14-6.13,183.15,36.56,285.5,41.49,61.4,3,122.95-10.27,184.21-19.5,120.5-18.15,223,12.72,365,5.1V0Z" className="fill-bm-gold/5"></path>
                                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-bm-gold"></path>
                            </svg>
                        </div>
                        <div className="h-full w-full bg-bm-gold" />
                    </div>

                    <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-8">
                        <h2 className="font-serif text-4xl font-bold tracking-tight text-bm-dark sm:text-6xl">
                            Experience Mechanical Excellence
                        </h2>
                        <p className="mx-auto mt-6 max-w-2xl text-xl font-medium text-bm-dark/80">
                            Join the elite clientele who trust Brass Monkey for their most critical mechanical needs.
                        </p>
                        <div className="mt-12">
                            <Button size="lg" className="bg-bm-dark h-14 px-12 text-bm-gold hover:bg-bm-dark/90 font-bold transition-all hover:scale-105 active:scale-95 shadow-2xl rounded-lg group">
                                Schedule Your Service <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-[#120E0A] py-24 border-t border-bm-gold/5 relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
                     <div className="absolute top-0 left-1/4 w-96 h-96 bg-bm-gold rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid gap-16 lg:grid-cols-4 md:grid-cols-2">
                        {/* Column 1: Brand & Social */}
                        <div className="space-y-8">
                             <Link href="/" className="flex items-center gap-3 group">
                                <AppLogoIcon className="h-12 w-auto text-bm-gold transition-transform duration-500 group-hover:rotate-[360deg]" />
                                <span className="font-serif text-3xl font-bold tracking-tight text-bm-white">Brass Monkey</span>
                            </Link>
                            <p className="text-bm-muted text-sm leading-relaxed font-medium">
                                Redefining mechanical excellence since 2008. We combine heritage craftsmanship with future-ready precision to maintain the world's most critical systems.
                            </p>
                            <div className="flex gap-4">
                                {[Instagram, Twitter, Linkedin, Facebook].map((Icon, i) => (
                                    <a key={i} href="#" className="h-10 w-10 flex items-center justify-center rounded-lg bg-bm-white/5 border border-bm-white/10 text-bm-muted hover:text-bm-gold hover:border-bm-gold/30 hover:bg-bm-gold/5 transition-all duration-300">
                                        <Icon className="h-5 w-5" />
                                    </a>
                                ))}
                            </div>
                        </div>
                        
                        {/* Column 2: Track Service */}
                        <div>
                            <h4 className="font-bold text-bm-white mb-8 uppercase tracking-[0.2em] text-xs text-bm-gold/80">Track Your Service</h4>
                            <p className="text-bm-muted text-sm mb-6 font-medium">Have a tracking ID? Monitor your mechanical restoration live.</p>
                            <Link 
                                href="#track-order" 
                                className="inline-flex items-center gap-2 text-bm-gold font-bold text-sm hover:underline underline-offset-4 group"
                            >
                                Track Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <div className="mt-6 pt-6 border-t border-bm-white/5">
                                <span className="text-[10px] text-bm-muted font-bold uppercase tracking-widest block mb-2">Sample IDs</span>
                                <div className="flex flex-wrap gap-2">
                                    {['BM-1001', 'BM-1002'].map(id => (
                                        <Link key={id} href={`/?number=${id}#track-order`} className="text-[10px] px-2 py-1 rounded bg-bm-white/5 border border-bm-white/10 text-bm-muted hover:text-bm-gold transition-colors">{id}</Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Professional Services */}
                        <div>
                            <h4 className="font-bold text-bm-white mb-8 uppercase tracking-[0.2em] text-xs text-bm-gold/80">Our Services</h4>
                            <ul className="space-y-4">
                                {[
                                    'Precision Balancing',
                                    'Mechanical Restoration',
                                    'Performance Tuning',
                                    'Diagnostic Inspection',
                                    'Preventive Maintenance'
                                ].map((service) => (
                                    <li key={service}>
                                        <Link href="#" className="text-bm-muted text-sm transition-colors hover:text-bm-gold font-medium flex items-center gap-2 group">
                                            <div className="h-1 w-0 bg-bm-gold group-hover:w-2 transition-all duration-300" />
                                            {service}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 4: Newsletter */}
                        <div>
                            <h4 className="font-bold text-bm-white mb-8 uppercase tracking-[0.2em] text-xs text-bm-gold/80">Newsletter</h4>
                            <p className="text-bm-muted text-sm mb-6 font-medium">Join our mailing list for technical insights and project showcases.</p>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    placeholder="your@email.com" 
                                    className="w-full bg-bm-white/5 border border-bm-white/10 rounded-lg h-12 px-4 text-sm text-bm-white focus:outline-none focus:border-bm-gold transition-colors placeholder:text-bm-muted/30"
                                />
                                <button className="absolute right-1 top-1 h-10 px-4 bg-bm-gold text-bm-dark rounded-md text-xs font-bold hover:bg-bm-gold-hover transition-colors">
                                    Join
                                </button>
                            </div>
                            <p className="mt-4 text-[10px] text-bm-muted/40 font-medium italic">
                                *Exclusive updates for mechanical professionals.
                            </p>
                        </div>
                    </div>
                    
                    <div className="mt-24 pt-8 border-t border-bm-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[11px] font-bold tracking-widest text-bm-muted/30 uppercase">
                            © 2026 Brass Monkey Co. All Engineering Rights Reserved.
                        </p>
                        <div className="flex gap-8">
                            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                                <Link key={item} href="#" className="text-[11px] font-bold tracking-widest text-bm-muted/30 uppercase hover:text-bm-gold transition-colors">{item}</Link>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

            {/* Back to Top Button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-8 right-8 z-50 h-14 w-14 rounded-full bg-bm-gold text-bm-dark shadow-2xl shadow-bm-gold/20 flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90 hover:bg-bm-gold-hover group ${
                    showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                }`}
                aria-label="Back to top"
            >
                <ArrowUp className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-1" />
                <div className="absolute inset-0 rounded-full border-4 border-bm-gold/20 animate-ping" />
            </button>
        </div>
    );
}
