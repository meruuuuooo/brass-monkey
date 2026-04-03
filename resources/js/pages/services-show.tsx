import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Wrench,
    Clock,
    CheckCircle2,
    ShieldCheck,
    DollarSign,
    ArrowUp,
    Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { login } from '@/routes';
import serviceRoutes from '@/routes/services';

interface Service {
    id: number;
    name: string;
    description: string | null;
    duration: string | null;
    price: string;
    image_path: string | null;
    is_active: boolean;
}

interface Props {
    service: Service;
}

export default function ServiceShow({ service }: Props) {
    const { auth } = usePage().props as { auth: { user: any } };
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        service_id: service.id.toString(),
        notes: '',
    });

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

    const handleBooking = (e: React.FormEvent) => {
        e.preventDefault();

        if (!auth?.user) {
            Swal.fire({
                icon: 'warning',
                title: 'Login Required',
                text: 'Please log in to book this service.',
                confirmButtonColor: '#ffc107',
            });

            return;
        }

        post(serviceRoutes.book().url, {
            onSuccess: () => {
                setIsBookingOpen(false);
                reset();
                Swal.fire({
                    icon: 'success',
                    title: 'Service Booked!',
                    text: 'Your service has been booked successfully. You can track your order in your dashboard.',
                    confirmButtonColor: '#ffc107',
                });
            },
        });
    };

    return (
        <div className="min-h-screen bg-bm-dark text-bm-white selection:bg-bm-gold/30 selection:text-bm-white">
            <Head title={`${service.name} | Brass Monkey`} />

            {/* Navigation */}

            {/* Navigation */}
            <header className="fixed top-0 z-50 w-full border-b border-bm-border/10 bg-bm-dark/80 backdrop-blur-md">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
                    <div className="flex items-center gap-8">
                        <Link
                            href="/"
                            className="group flex items-center gap-3"
                        >
                            <AppLogoIcon className="h-10 w-auto text-bm-gold transition-transform duration-300 group-hover:scale-110" />
                            <span className="font-serif text-xl font-bold tracking-tight text-bm-white">
                                Brass Monkey
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-8">
                        <nav className="hidden items-center gap-6 lg:flex">
                            {[
                                { name: 'Track Order', href: '/#track-order' },
                                { name: 'Services', href: '/#services' },
                                { name: 'Blog', href: '/#blogs' },
                                { name: 'About', href: '/#about' },
                                { name: 'Product', href: '/#product' },
                            ].map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="cursor-pointer text-[13px] font-bold tracking-wider text-bm-muted uppercase transition-colors hover:text-bm-gold"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-6 border-l border-bm-white/10 pl-8">
                            {auth && auth.user ? (
                                <Link
                                    href="/dashboard"
                                    className="text-[13px] font-bold tracking-wider text-bm-white uppercase transition-colors hover:text-bm-gold cursor-pointer"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={login()}
                                    className="text-[13px] font-bold tracking-wider text-bm-white uppercase transition-colors hover:text-bm-gold cursor-pointer"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-24">
                {/* Hero Section with Service Image */}
                <section className="relative h-[400px] w-full overflow-hidden">
                    {service.image_path ? (
                        <img
                            src={
                                service.image_path.startsWith('http')
                                    ? service.image_path
                                    : `/storage/${service.image_path}`
                            }
                            alt={service.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bm-gold/20 to-bm-gold/5">
                            <Wrench className="h-32 w-32 text-bm-gold/30" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-bm-dark via-bm-dark/50 to-transparent" />

                    {/* Hero Content */}
                    <div className="absolute inset-0 flex items-end">
                        <div className="w-full px-6 pb-12 lg:px-8">
                            <div className="mx-auto max-w-7xl">
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-bm-gold/10 px-3 py-1 text-xs font-bold tracking-widest text-bm-gold uppercase">
                                    <Sparkles className="h-3 w-3" />{' '}
                                    Professional Service
                                </div>
                                <h1 className="mb-4 text-4xl font-black tracking-tight text-bm-white md:text-5xl lg:text-6xl">
                                    {service.name}
                                </h1>
                                <p className="max-w-2xl text-lg text-bm-white/80">
                                    Expert care tailored for your equipment
                                    needs
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Service Details Section */}
                <section className="border-b border-bm-border/10 py-16">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid gap-12 lg:grid-cols-3">
                            {/* Main Content */}
                            <div className="space-y-8 lg:col-span-2">
                                {/* Description */}
                                <div>
                                    <h2 className="mb-4 text-2xl font-black tracking-tight text-bm-white">
                                        About This Service
                                    </h2>
                                    <p className="text-base leading-relaxed text-bm-white/70">
                                        {service.description ||
                                            'Expert service provided by our certified technicians using premium components and precision calibration. We ensure the highest standards of quality and customer satisfaction.'}
                                    </p>
                                </div>

                                {/* Service Highlights */}
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <Card className="border-bm-border/30 bg-bm-dark/50 transition-colors hover:bg-bm-dark/80">
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="rounded-lg bg-bm-gold/10 p-3">
                                                    <Clock className="h-6 w-6 text-bm-gold" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-bm-white">
                                                        Estimated Duration
                                                    </h3>
                                                    <p className="mt-1 text-sm text-bm-white/60">
                                                        {service.duration ||
                                                            'Flexible scheduling'}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-bm-border/30 bg-bm-dark/50 transition-colors hover:bg-bm-dark/80">
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="rounded-lg bg-bm-gold/10 p-3">
                                                    <DollarSign className="h-6 w-6 text-bm-gold" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-bm-white">
                                                        Starting Price
                                                    </h3>
                                                    <p className="mt-1 text-sm text-bm-white/60">
                                                        ${service.price} +
                                                        applicable taxes
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-bm-border/30 bg-bm-dark/50 transition-colors hover:bg-bm-dark/80">
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="rounded-lg bg-bm-gold/10 p-3">
                                                    <CheckCircle2 className="h-6 w-6 text-bm-gold" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-bm-white">
                                                        Quality Assured
                                                    </h3>
                                                    <p className="mt-1 text-sm text-bm-white/60">
                                                        Triple-point
                                                        verification process
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-bm-border/30 bg-bm-dark/50 transition-colors hover:bg-bm-dark/80">
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="rounded-lg bg-bm-gold/10 p-3">
                                                    <ShieldCheck className="h-6 w-6 text-bm-gold" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-bm-white">
                                                        Professional Technicians
                                                    </h3>
                                                    <p className="mt-1 text-sm text-bm-white/60">
                                                        Certified and
                                                        experienced staff
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Why Choose Section */}
                                <div>
                                    <h2 className="mb-6 text-2xl font-black tracking-tight text-bm-white">
                                        Why Choose This Service
                                    </h2>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-bm-gold" />
                                            <span className="text-bm-white/80">
                                                Expert technicians with years of
                                                industry experience
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-bm-gold" />
                                            <span className="text-bm-white/80">
                                                Premium quality components and
                                                latest diagnostic equipment
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-bm-gold" />
                                            <span className="text-bm-white/80">
                                                Comprehensive warranty on all
                                                completed service work
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-bm-gold" />
                                            <span className="text-bm-white/80">
                                                Real-time order tracking and
                                                detailed progress updates
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-bm-gold" />
                                            <span className="text-bm-white/80">
                                                Transparent pricing with no
                                                hidden charges
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Booking Card */}
                            <div className="lg:col-span-1">
                                <Card className="sticky top-32 border-bm-gold/30 bg-gradient-to-b from-bm-gold/5 to-bm-dark/50">
                                    <CardContent className="p-8">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <p className="text-sm font-bold tracking-widest text-bm-white/60 uppercase">
                                                    Service Price
                                                </p>
                                                <p className="text-4xl font-black text-bm-gold">
                                                    ${service.price}
                                                </p>
                                                <p className="text-xs text-bm-white/50">
                                                    Plus applicable taxes and
                                                    fees
                                                </p>
                                            </div>

                                            <form
                                                onSubmit={handleBooking}
                                                className="space-y-4"
                                            >
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-bm-white">
                                                        Additional Notes
                                                        (Optional)
                                                    </label>
                                                    <Textarea
                                                        placeholder="Tell us more about your requirements..."
                                                        value={data.notes}
                                                        onChange={(e) =>
                                                            setData(
                                                                'notes',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="min-h-[100px] resize-none border-bm-border/30 bg-bm-dark/50 text-bm-white placeholder:text-bm-white/30"
                                                    />
                                                </div>

                                                {!auth?.user && (
                                                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                                                        <p className="text-xs text-amber-200">
                                                            <Link
                                                                href="/login"
                                                                className="font-bold underline hover:text-amber-100 cursor-pointer"
                                                            >
                                                                Sign in
                                                            </Link>{' '}
                                                            to book this service
                                                        </p>
                                                    </div>
                                                )}

                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        processing ||
                                                        !auth?.user
                                                    }
                                                    className="h-12 w-full rounded-xl bg-bm-gold font-black text-bm-dark shadow-lg shadow-bm-gold/20 transition-all hover:-translate-y-1 hover:bg-bm-gold/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                                >
                                                    {processing
                                                        ? 'Booking...'
                                                        : 'Book This Service'}
                                                </Button>

                                                <p className="text-center text-xs text-bm-white/50">
                                                    You'll receive a tracking
                                                    number to monitor your
                                                    service progress
                                                </p>
                                            </form>

                                            <div className="border-t border-bm-border/30 pt-4">
                                                <Link
                                                    href="/#track-order"
                                                    className="text-xs font-bold text-bm-gold transition-colors hover:text-bm-gold/80 cursor-pointer"
                                                >
                                                    Track an existing order
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="border-y border-bm-border/10 bg-bm-gold/5 py-16">
                    <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
                        <h2 className="mb-4 text-3xl font-black tracking-tight text-bm-white">
                            Ready to Get Your Service Done?
                        </h2>
                        <p className="mx-auto mb-8 max-w-2xl text-lg text-bm-white/70">
                            Book this service today and experience the Brass
                            Monkey difference in precision and quality.
                        </p>
                        <Button
                            onClick={() => {
                                if (!auth?.user) {
                                    Swal.fire({
                                        icon: 'warning',
                                        title: 'Login Required',
                                        text: 'Please log in to book this service.',
                                        confirmButtonColor: '#ffc107',
                                    });

                                    return;
                                }

                                document
                                    .querySelector('form')
                                    ?.dispatchEvent(
                                        new Event('submit', { bubbles: true }),
                                    );
                            }}
                            className="h-12 rounded-full bg-bm-gold px-12 font-black text-bm-dark shadow-lg shadow-bm-gold/20 transition-all hover:-translate-y-1 hover:bg-bm-gold/90 active:scale-95 cursor-pointer"
                        >
                            Book Now
                        </Button>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-bm-gold/5 bg-[#120E0A] py-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-6 border-b border-bm-white/5 pb-8 md:flex-row">
                        <div>
                            <h3 className="font-serif text-lg font-bold tracking-tight text-bm-white">
                                Brass Monkey
                            </h3>
                            <p className="mt-1 text-sm text-bm-white/50">
                                Precision Mechanical Excellence
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="text-sm font-bold text-bm-gold transition-colors hover:text-bm-gold/80 cursor-pointer"
                        >
                            Back to Home
                        </Link>
                    </div>
                    <p className="pt-8 text-center text-xs text-bm-white/30">
                        © 2026 Brass Monkey. All rights reserved.
                    </p>
                </div>
            </footer>

            {/* Back to Top Button */}
            <button
                onClick={scrollToTop}
                className={`group fixed right-8 bottom-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-bm-gold text-bm-dark shadow-2xl shadow-bm-gold/20 transition-all duration-500 hover:scale-110 hover:bg-bm-gold-hover active:scale-90 cursor-pointer ${showBackToTop
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-20 opacity-0'
                    }`}
                aria-label="Back to top"
            >
                <ArrowUp className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-1" />
                <div className="absolute inset-0 animate-ping rounded-full border-4 border-bm-gold/20" />
            </button>
        </div>
    );
}
