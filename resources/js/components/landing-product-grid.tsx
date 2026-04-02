import { Link } from '@inertiajs/react';
import { Package, ArrowRight, ShoppingCart } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    price: string | number;
    image_path: string | null;
    category: { id: number; name: string } | null;
    stock_quantity: number;
}

interface Props {
    products: Product[];
}

export default function LandingProductGrid({ products }: Props) {
    if (!products || products.length === 0) return null;

    return (
        <section id="product" className="relative bg-bm-dark py-32 overflow-hidden">
            {/* Subtle glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-bm-gold/5 blur-[120px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section header */}
                <div className="flex items-end justify-between mb-14">
                    <div>
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-bm-gold/20 bg-bm-gold/5 px-5 py-2 backdrop-blur-sm">
                            <ShoppingCart className="h-3.5 w-3.5 text-bm-gold" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-bm-gold">
                                Our Products
                            </span>
                        </div>
                        <h2 className="font-serif text-4xl font-bold tracking-tight text-bm-white sm:text-5xl">
                            Shop Our Catalog
                        </h2>
                        <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-bm-muted/80">
                            Parts, upgrades, and merchandise — built to the same standard as our service.
                        </p>
                    </div>
                    <Link
                        href="/products"
                        className="hidden items-center gap-2 text-sm font-bold uppercase tracking-widest text-bm-gold underline-offset-4 hover:underline sm:flex group cursor-pointer"
                    >
                        View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Product grid — Tailwind UI layout adapted to dark theme */}
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                    {products.map((product) => (
                        <div key={product.id} className="group relative">
                            <div className="aspect-square w-full overflow-hidden rounded-2xl bg-bm-white/4 border border-bm-white/10 group-hover:border-bm-gold/30 transition-colors">
                                {product.image_path ? (
                                    <img
                                        src={`/storage/${product.image_path}`}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:opacity-80 group-hover:scale-105 transition-all duration-500 lg:h-80 lg:object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-bm-muted/20">
                                        <Package className="h-16 w-16" />
                                    </div>
                                )}

                                {/* Out of stock overlay */}
                                {product.stock_quantity <= 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 backdrop-blur-sm">
                                        <span className="rounded-full bg-red-500/20 border border-red-500/30 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-red-400">
                                            Out of Stock
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    {product.category && (
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-bm-gold mb-1">
                                            {product.category.name}
                                        </p>
                                    )}
                                    <h3 className="text-sm font-bold text-bm-white group-hover:text-bm-gold transition-colors truncate">
                                        {/* Entire card is clickable */}
                                        <Link href={`/shop/${product.id}`} className="cursor-pointer">
                                            <span aria-hidden="true" className="absolute inset-0 cursor-pointer" />
                                            {product.name}
                                        </Link>
                                    </h3>
                                </div>
                                <p className="shrink-0 font-mono text-sm font-black text-bm-gold">
                                    ${Number(product.price).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile-only View All */}
                <div className="mt-12 flex justify-center sm:hidden">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 rounded-xl border border-bm-gold/30 bg-bm-gold/5 px-8 py-3 text-sm font-bold uppercase tracking-widest text-bm-gold hover:bg-bm-gold/10 transition-colors cursor-pointer"
                    >
                        Browse All Products <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
