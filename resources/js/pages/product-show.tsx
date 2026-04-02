import { Head, Link, useForm } from '@inertiajs/react';
import {
    Package, ShoppingCart, Star, CheckCircle2,
    AlertCircle, Tag, Info, ArrowRight, ChevronRight,
    ShieldCheck, Phone, Mail,
} from 'lucide-react';
import { useState, useRef } from 'react';
import Swal from 'sweetalert2';
import AppLogoIcon from '@/components/app-logo-icon';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { login, dashboard } from '@/routes';

interface Category { id: number; name: string; }
interface Product {
    id: number;
    name: string;
    sku: string;
    description: string | null;
    price: string | number;
    stock_quantity: number;
    low_stock_threshold: number;
    image_path: string | null;
    is_available: boolean;
    category: Category | null;
}
interface Props {
    product: Product;
    related: Product[];
    auth?: { user: any };
}

function StarRating({ value = 4, max = 5 }: { value?: number; max?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: max }).map((_, i) => (
                <Star key={i} className={`size-4 fill-current ${i < value ? 'text-bm-gold' : 'text-bm-white/10'}`} />
            ))}
        </div>
    );
}

export default function PublicProductShow({ product, related, auth }: Props) {
    const inStock = product.stock_quantity > 0;
    const [mainImage] = useState(product.image_path);
    const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));


    const { get } = useForm({ number: '' });

    const handleEnquire = () => {
        Swal.fire({
            title: 'Enquire About This Product',
            html: `
                <p class="text-sm text-gray-500 mb-4">Interested in <strong>${product.name}</strong> at <strong>$${Number(product.price).toFixed(2)}</strong>?</p>
                <p class="text-sm text-gray-500">Log in to your portal to add it to your cart, or contact us directly.</p>
            `,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#d4a200',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Go to Login',
            cancelButtonText: 'Maybe Later',
        }).then(result => {
            if (result.isConfirmed) window.location.href = '/login';
        });
    };

    return (
        <div className="min-h-screen bg-bm-dark text-bm-white selection:bg-bm-gold/30">
            <Head title={`${product.name} — Brass Monkey`} />

            {/* ── Nav ─────────────────────────────────────────────── */}
            {/* Navigation */}
            <header className="fixed top-0 z-50 w-full border-b border-bm-border/10 bg-bm-dark/80 backdrop-blur-md">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
                    <div className="flex items-center gap-8">
                        <Link
                            href="/"
                            className="group flex cursor-pointer items-center gap-3"
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
                            <Link href="/#product" className="cursor-pointer text-[13px] font-bold text-bm-muted hover:text-bm-gold uppercase tracking-wider transition-colors">
                                Shop
                            </Link>
                            {auth && auth.user ? (
                                <Link
                                    href="/dashboard"
                                    className="cursor-pointer text-[13px] font-bold tracking-wider text-bm-white uppercase transition-colors hover:text-bm-gold"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={login()}
                                    className="cursor-pointer text-[13px] font-bold tracking-wider text-bm-white uppercase transition-colors hover:text-bm-gold"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-20">

                {/* ── Product Detail ─────────────────────────────── */}
                <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-x-16 xl:gap-x-20">

                        {/* Left — Image */}
                        <div className="space-y-4">
                            <div className="relative aspect-square overflow-hidden rounded-3xl bg-bm-white/3 border border-bm-white/10 flex items-center justify-center">
                                {mainImage ? (
                                    <img
                                        src={`/storage/${mainImage}`}
                                        alt={product.name}
                                        className="w-full h-full object-contain p-6"
                                    />
                                ) : (
                                    <Package className="size-28 text-bm-white/10" />
                                )}
                                {/* Stock badge overlay */}
                                <div className="absolute top-4 left-4">
                                    {product.stock_quantity <= 0 ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-red-500/20 border border-red-500/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-red-400">
                                            <AlertCircle className="size-3" /> Out of Stock
                                        </span>
                                    ) : product.stock_quantity <= product.low_stock_threshold ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
                                            <AlertCircle className="size-3" /> Low Stock
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                            {/* SKU */}
                            <div className="flex items-center gap-2 text-xs text-bm-muted/40">
                                <Tag className="size-3" />
                                <span className="font-mono">SKU: {product.sku}</span>
                            </div>
                        </div>

                        {/* Right — Info */}
                        <div className="mt-12 lg:mt-0 space-y-7">
                            {/* Category pill */}
                            {product.category && (
                                <div className="inline-flex items-center gap-2 rounded-full border border-bm-gold/20 bg-bm-gold/5 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-bm-gold">
                                    {product.category.name}
                                </div>
                            )}

                            <h1 className="font-serif text-4xl font-bold tracking-tight lg:text-5xl leading-tight">
                                {product.name}
                            </h1>

                            {/* Rating placeholder */}
                            <div className="flex items-center gap-3">
                                <StarRating value={4} />
                                <span className="text-sm text-bm-muted">4.0 out of 5</span>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-3">
                                <span className="font-mono font-black text-5xl text-bm-gold">
                                    ${Number(product.price).toFixed(2)}
                                </span>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-bm-white/10" />

                            {/* Stock status */}
                            {inStock ? (
                                <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-sm font-bold text-emerald-400">
                                    <CheckCircle2 className="size-4" /> In Stock
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm font-bold text-red-400">
                                    <AlertCircle className="size-4" /> Out of Stock
                                </span>
                            )}

                            {/* Description */}
                            {product.description && (
                                <div className="space-y-2">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-bm-muted uppercase tracking-widest">
                                        <Info className="size-4" /> Details
                                    </h3>
                                    <p className="text-sm leading-relaxed text-bm-muted/80 whitespace-pre-line">
                                        {product.description}
                                    </p>
                                </div>
                            )}

                            <div className="border-t border-bm-white/10" />

                            {/* CTA */}
                            {auth?.user ? (
                                /* Logged in → go to portal product page */
                                <Link
                                    href={`/products/${product.id}`}
                                    className="cursor-pointer flex w-full items-center justify-center gap-3 h-16 rounded-2xl bg-bm-gold text-bm-dark font-black text-base uppercase tracking-widest shadow-[0_20px_40px_-12px_rgba(212,162,0,0.35)] hover:bg-bm-gold/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    <ShoppingCart className="size-5" /> Add to Cart
                                    <ArrowRight className="size-4 ml-1" />
                                </Link>
                            ) : (
                                /* Guest → enquiry & login prompt */
                                <>
                                    <button
                                        onClick={handleEnquire}
                                        disabled={!inStock}
                                        className={`flex w-full items-center justify-center gap-3 h-16 rounded-2xl font-black text-base uppercase tracking-widest transition-all ${inStock
                                            ? 'cursor-pointer bg-bm-gold text-bm-dark shadow-[0_20px_40px_-12px_rgba(212,162,0,0.35)] hover:bg-bm-gold/90 hover:scale-[1.02] active:scale-[0.98]'
                                            : 'bg-bm-white/5 text-bm-muted/50 cursor-not-allowed border border-bm-white/10'
                                            }`}
                                    >
                                        <ShoppingCart className="size-5" />
                                        {inStock ? 'Order / Enquire' : 'Unavailable'}
                                    </button>
                                    <p className="text-center text-xs text-bm-muted/40">
                                        <Link href={login()} className="cursor-pointer text-bm-gold hover:underline underline-offset-4">Log in</Link> to add to your cart directly.
                                    </p>
                                </>
                            )}

                            {/* Trust badges */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                {[
                                    { icon: ShieldCheck, label: 'Quality Guaranteed' },
                                    { icon: Phone, label: 'Expert Support' },
                                    { icon: Mail, label: 'Contact for Pricing' },
                                    { icon: CheckCircle2, label: 'Genuine Parts' },
                                ].map(({ icon: Icon, label }) => (
                                    <div key={label} className="flex items-center gap-2 rounded-xl border border-bm-white/10 bg-bm-white/2 px-3 py-2.5">
                                        <Icon className="size-4 shrink-0 text-bm-gold" />
                                        <span className="text-xs font-bold text-bm-muted/70">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Related Products ─────────────────────────── */}
                {related.length > 0 && (
                    <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="font-serif text-2xl font-bold tracking-tight">You Might Also Like</h2>
                            <Link href="/#product" className="cursor-pointer text-xs font-bold uppercase tracking-widest text-bm-gold hover:underline underline-offset-4">
                                Browse All
                            </Link>
                        </div>

                        <Carousel
                            opts={{
                                align: 'start',
                                loop: true,
                            }}
                            plugins={[plugin.current]}
                            onMouseEnter={plugin.current.stop}
                            onMouseLeave={plugin.current.reset}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-4 sm:-ml-6">
                                {related.map((p) => (
                                    <CarouselItem key={p.id} className="pl-4 sm:pl-6 md:basis-1/2 lg:basis-1/4">
                                        <div className="group relative h-full">
                                            <div className="aspect-square w-full overflow-hidden rounded-2xl bg-bm-white/3 border border-bm-white/10 group-hover:border-bm-gold/30 transition-colors">
                                                {p.image_path ? (
                                                    <img
                                                        src={`/storage/${p.image_path}`}
                                                        alt={p.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 group-hover:opacity-80 transition-all duration-500 lg:h-80"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-bm-white/10">
                                                        <Package className="size-12" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-4 flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    {p.category && (
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-bm-gold mb-1">{p.category.name}</p>
                                                    )}
                                                    <h3 className="text-sm font-bold text-bm-white group-hover:text-bm-gold transition-colors truncate">
                                                        <Link href={`/shop/${p.id}`} className="cursor-pointer">
                                                            <span aria-hidden="true" className="absolute inset-0 cursor-pointer" />
                                                            {p.name}
                                                        </Link>
                                                    </h3>
                                                </div>
                                                <p className="shrink-0 font-mono text-sm font-black text-bm-gold">
                                                    ${Number(p.price).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <div className="hidden lg:block">
                                <CarouselPrevious className="cursor-pointer absolute -left-12 top-1/2 -translate-y-1/2 border-bm-white/10 bg-bm-dark/50 text-bm-white hover:bg-bm-gold hover:text-bm-dark" />
                                <CarouselNext className="cursor-pointer absolute -right-12 top-1/2 -translate-y-1/2 border-bm-white/10 bg-bm-dark/50 text-bm-white hover:bg-bm-gold hover:text-bm-dark" />
                            </div>
                        </Carousel>
                    </section>
                )}
            </main>

            {/* ── Footer ───────────────────────────────────────── */}
            <footer className="border-t border-bm-gold/10 bg-[#120E0A] py-10">
                <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 lg:px-8">
                    <Link href="/" className="group flex cursor-pointer items-center gap-3">
                        <AppLogoIcon className="h-8 w-auto text-bm-gold" />
                        <span className="font-serif text-lg font-bold text-bm-white">Brass Monkey</span>
                    </Link>
                    <p className="text-xs font-medium text-bm-muted/40">© {new Date().getFullYear()} Brass Monkey. All rights reserved.</p>
                    <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-bm-muted/50">
                        <Link href="/#services" className="cursor-pointer hover:text-bm-gold transition-colors">Services</Link>
                        <Link href="/#product" className="cursor-pointer hover:text-bm-gold transition-colors">Shop</Link>
                        <Link href={login()} className="cursor-pointer hover:text-bm-gold transition-colors">Login</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
