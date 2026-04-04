import { Link } from '@inertiajs/react';
import { Instagram, Twitter, Linkedin, Facebook, ArrowUp, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';

export function AppFooter() {
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

    return (
        <>
            <footer className="bg-[#120E0A] py-24 border-t border-bm-gold/5 relative overflow-hidden mt-auto">
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-bm-gold rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid gap-16 lg:grid-cols-4 md:grid-cols-2">
                        {/* Column 1: Brand & Social */}
                        <div className="space-y-8">
                            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                                <AppLogoIcon className="h-12 w-auto text-bm-gold transition-transform duration-500 group-hover:rotate-[360deg]" />
                                <span className="font-serif text-3xl font-bold tracking-tight text-bm-white">Brass Monkey</span>
                            </Link>
                            <p className="text-bm-muted text-sm leading-relaxed font-medium">
                                Redefining mechanical excellence since 2008. We combine heritage craftsmanship with future-ready precision to maintain the world's most critical systems.
                            </p>
                            <div className="flex gap-4">
                                {[Instagram, Twitter, Linkedin, Facebook].map((Icon, i) => (
                                    <a key={i} href="#" className="h-10 w-10 flex items-center justify-center rounded-lg bg-bm-white/5 border border-bm-white/10 text-bm-muted hover:text-bm-gold hover:border-bm-gold/30 hover:bg-bm-gold/5 transition-all duration-300 cursor-pointer">
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
                                href="/#track-order"
                                className="inline-flex items-center gap-2 text-bm-gold font-bold text-sm hover:underline underline-offset-4 group cursor-pointer"
                            >
                                Track Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <div className="mt-6 pt-6 border-t border-bm-white/5">
                                <span className="text-[10px] text-bm-muted font-bold uppercase tracking-widest block mb-2">Sample IDs</span>
                                <div className="flex flex-wrap gap-2">
                                    {['BM-1001', 'BM-1002'].map(id => (
                                        <Link key={id} href={`/?number=${id}#track-order`} className="text-[10px] px-2 py-1 rounded bg-bm-white/5 border border-bm-white/10 text-bm-muted hover:text-bm-gold transition-colors cursor-pointer">{id}</Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Professional Services */}
                        <div>
                            <h4 className="font-bold text-bm-white mb-8 uppercase tracking-[0.2em] text-xs text-bm-gold/80">Our Services</h4>
                            <ul className="space-y-4">
                                {[
                                    { label: 'Precision Balancing', href: '/#services' },
                                    { label: 'Mechanical Restoration', href: '/#services' },
                                    { label: 'Performance Tuning', href: '/#services' },
                                    { label: 'Diagnostic Inspection', href: '/#services' },
                                    { label: 'Preventive Maintenance', href: '/#services' }
                                ].map((service) => (
                                    <li key={service.label}>
                                        <Link href={service.href} className="text-bm-muted text-sm transition-colors hover:text-bm-gold font-medium flex items-center gap-2 group cursor-pointer">
                                            <div className="h-1 w-0 bg-bm-gold group-hover:w-2 transition-all duration-300" />
                                            {service.label}
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
                                <button className="absolute right-1 top-1 h-10 px-4 bg-bm-gold text-bm-dark rounded-md text-xs font-bold hover:bg-bm-gold-hover transition-colors cursor-pointer">
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
                            © {new Date().getFullYear()} Brass Monkey Co. All Engineering Rights Reserved.
                        </p>
                        <div className="flex gap-8">
                            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                                <Link key={item} href="#" className="text-[11px] font-bold tracking-widest text-bm-muted/30 uppercase hover:text-bm-gold transition-colors cursor-pointer">{item}</Link>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

            {/* Back to Top Button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-8 right-8 z-50 h-14 w-14 rounded-full bg-bm-gold text-bm-dark shadow-2xl shadow-bm-gold/20 flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90 hover:bg-bm-gold-hover group cursor-pointer ${showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                    }`}
                aria-label="Back to top"
            >
                <ArrowUp className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-1" />
                <div className="absolute inset-0 rounded-full border-4 border-bm-gold/20 animate-ping" />
            </button>
        </>
    );
}
