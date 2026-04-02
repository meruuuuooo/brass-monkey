import { Head, useForm } from '@inertiajs/react';
import {
    Wrench,
    Clock,
    ChevronRight,
    CheckCircle2,
    Info,
    Sparkles,
    ShieldCheck,
    CalendarCheck2
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
// import AppLayout from '@/layouts/app-layout';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import serviceRoutes from '@/routes/services';
import type { BreadcrumbItem } from '@/types';

interface Service {
    id: number;
    name: string;
    description: string | null;
    duration: string | null;
    price: string;
    image_path: string | null;
}

interface Props {
    services: Service[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Services', href: '/services' },
];

export default function ServicesIndex({ services }: Props) {
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        service_id: '',
        notes: '',
    });

    const handleBookNow = (service: Service) => {
        setSelectedService(service);
        setData('service_id', service.id.toString());
        setIsBookingOpen(true);
    };

    const confirmBooking = () => {
        post(serviceRoutes.book().url, {
            onSuccess: () => {
                setIsBookingOpen(false);
                reset();
            },
        });
    };

    return (
        <AppHeaderLayout>
            <Head title="Our Services" />

            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4">
                {/* Header Section */}
                <div className="text-center space-y-4 max-w-2xl mx-auto pt-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bm-gold/10 text-bm-gold text-xs font-bold tracking-widest uppercase">
                        <Sparkles className="size-3" /> Professional Care
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">Our Services</h1>
                    <p className="text-muted-foreground text-lg font-medium">
                        Expert maintenance and repair services tailored for your coffee equipment and machinery.
                    </p>
                </div>

                {/* Services List */}
                <div className="grid gap-8">
                    {services.length > 0 ? (
                        services.map((service) => (
                            <Card key={service.id} className="group relative overflow-hidden border-sidebar-border/40 hover:border-bm-gold/30 hover:shadow-2xl hover:shadow-bm-gold/5 transition-all duration-500 rounded-3xl">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row h-full">
                                        {/* Service Image Placeholder / Background */}
                                        <div className="relative w-full md:w-[400px] h-[250px] md:h-auto overflow-hidden bg-muted/30">
                                            {service.image_path ? (
                                                <img
                                                    src={service.image_path.startsWith('http') ? service.image_path : `/storage/${service.image_path}`}
                                                    alt={service.name}
                                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-bm-gold/20 to-bm-gold/5">
                                                    <Wrench className="size-20 text-bm-gold/20 rotate-12" />
                                                </div>
                                            )}
                                            {/* Overlay gradient for mobile */}
                                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/80 to-transparent md:hidden" />
                                        </div>

                                        {/* Service Details */}
                                        <div className="flex-1 p-8 md:p-10 flex flex-col justify-between relative">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground group-hover:text-bm-gold transition-colors duration-300">
                                                        {service.name}
                                                    </h2>
                                                    {parseFloat(service.price) < 50 && (
                                                        <Badge className="bg-green-500/10 text-green-600 border-none font-bold px-2 py-0 h-6 text-[10px] uppercase tracking-wider">
                                                            Best Value
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-muted-foreground/80 uppercase tracking-widest">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="size-4 text-bm-gold" />
                                                        {service.duration || 'Flexible'}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="size-4 text-bm-gold" />
                                                        Price starts at <span className="text-foreground">${service.price}</span>
                                                    </div>
                                                </div>

                                                <p className="text-muted-foreground leading-relaxed text-base font-medium max-w-xl">
                                                    {service.description || "Expert service provided by our certified technicians using premium components and precision calibration."}
                                                </p>
                                            </div>

                                            <div className="mt-8 flex items-center justify-between border-t border-border/40 pt-8">
                                                <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase opacity-60">
                                                    <div className="flex items-center gap-1.5">
                                                        <ShieldCheck className="size-3.5" /> Quality Guaranteed
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => handleBookNow(service)}
                                                    className="bg-bm-gold hover:bg-bm-gold/90 text-white font-black px-8 h-12 rounded-2xl shadow-lg shadow-bm-gold/20 group/btn transition-all hover:-translate-y-1 active:scale-95"
                                                >
                                                    Book Now <ChevronRight className="ml-2 size-4 group-hover/btn:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6 bg-muted/5 rounded-[3rem] border-2 border-dashed border-sidebar-border/50">
                            <div className="relative">
                                <div className="absolute inset-0 blur-3xl bg-bm-gold/10 rounded-full" />
                                <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-bm-gold/10 text-bm-gold border border-bm-gold/20 rotate-3">
                                    <Wrench className="size-10" />
                                </div>
                            </div>
                            <div className="max-w-md space-y-2">
                                <h3 className="text-2xl font-black tracking-tight text-foreground">No services available</h3>
                                <p className="text-muted-foreground font-medium">
                                    We're currently updating our service offerings. Please check back later or contact us for custom requests.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="rounded-2xl border-bm-gold/30 text-bm-gold font-bold hover:bg-bm-gold hover:text-white px-8"
                                onClick={() => window.location.href = '/support'}
                            >
                                Contact Support
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer Assurance */}
                <div className="mt-10 p-8 rounded-3xl bg-muted/10 border border-sidebar-border/30 flex flex-col md:flex-row items-center gap-6 justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bm-gold/10 text-bm-gold">
                            <Info className="size-6" />
                        </div>
                        <div>
                            <p className="font-bold text-foreground">Need a custom quote?</p>
                            <p className="text-sm text-muted-foreground font-medium">For complex machine repairs or multiple units, contact our support team.</p>
                        </div>
                    </div>
                    <Button variant="outline" className="rounded-2xl border-bm-gold/30 text-bm-gold font-bold hover:bg-bm-gold hover:text-white border-2">
                        Message Support
                    </Button>
                </div>
            </div>

            {/* Booking Confirmation Dialog */}
            <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8 border-none overflow-hidden ring-offset-background">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                        <CalendarCheck2 className="size-48 text-bm-gold -rotate-12" />
                    </div>

                    <DialogHeader className="relative">
                        <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                            Confirm Booking
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium pt-2">
                            You're booking <span className="text-bm-gold font-bold">{selectedService?.name}</span>. Our team will review your request and get back to you shortly.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-6 relative">
                        <div className="grid gap-2">
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Additional Notes</p>
                            <Textarea
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                placeholder="Any specific issues or preferences we should know about?"
                                rows={4}
                                className="rounded-2xl border-border/50 bg-muted/20 focus:ring-bm-gold/20 focus:border-bm-gold/50"
                            />
                        </div>

                        <div className="p-4 rounded-2xl bg-bm-gold/5 border border-bm-gold/10 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-bm-gold/60">Booking Summary</p>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm font-bold text-foreground">{selectedService?.name}</p>
                                    <p className="text-xs text-muted-foreground font-medium italic">Estimate price starts at ${selectedService?.price}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-muted-foreground uppercase">{selectedService?.duration}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="relative gap-3 sm:gap-0 mt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setIsBookingOpen(false)}
                            className="rounded-2xl font-bold hover:bg-muted"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmBooking}
                            disabled={processing}
                            className="rounded-2xl bg-bm-gold hover:bg-bm-gold/90 text-white font-black px-8 shadow-xl shadow-bm-gold/20"
                        >
                            {processing ? 'Processing...' : 'Confirm & Book'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppHeaderLayout>
    );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
            {children}
        </span>
    );
}
