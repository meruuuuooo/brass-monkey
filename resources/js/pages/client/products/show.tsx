import { Head, Link } from '@inertiajs/react';
import {
    Package, ShoppingCart, Star,
    CheckCircle2, AlertCircle, Tag, Info, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { CartButton, CartDrawer } from '@/components/cart-drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

interface Category { id: number; name: string; }

interface Product {
    id: number;
    name: string;
    slug: string;
    sku: string;
    description: string | null;
    price: string | number;
    cost_price: string | number | null;
    stock_quantity: number;
    low_stock_threshold: number;
    image_path: string | null;
    is_available: boolean;
    category: Category | null;
    created_at: string;
}

interface Props {
    product: Product;
    related: Product[];
}

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: max }).map((_, i) => (
                <Star
                    key={i}
                    className={cn(
                        'size-4 fill-current',
                        i < value ? 'text-bm-gold' : 'text-muted/40'
                    )}
                />
            ))}
        </div>
    );
}

function StockBadge({ qty, threshold }: { qty: number; threshold: number }) {
    if (qty <= 0) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1 text-sm font-bold text-red-500">
                <AlertCircle className="size-4" /> Out of Stock
            </span>
        );
    }
    if (qty <= threshold) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-sm font-bold text-amber-500">
                <AlertCircle className="size-4" /> Low Stock — Only {qty} left
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-sm font-bold text-emerald-500">
            <CheckCircle2 className="size-4" /> In Stock
        </span>
    );
}

export default function ProductShow({ product, related }: Props) {
    const [mainImage] = useState(product.image_path);
    const [cartOpen, setCartOpen] = useState(false);
    const inStock = product.stock_quantity > 0;

    const { cart, cartCount, subtotal, tax, total, addToCart, updateQty, removeFromCart, clearCart, inCart } = useCart();

    const cartItem = inCart(product.id);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Shop', href: '/products' },
        { title: product.name, href: '#' },
    ];


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={product.name} />

            <CartDrawer
                open={cartOpen}
                onClose={() => setCartOpen(false)}
                cart={cart}
                cartCount={cartCount}
                subtotal={subtotal}
                tax={tax}
                total={total}
                updateQty={updateQty}
                removeFromCart={removeFromCart}
                clearCart={clearCart}
            />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-10">

                {/* Cart button — top right */}
                <div className="flex justify-end">
                    <CartButton cartCount={cartCount} onClick={() => setCartOpen(true)} />
                </div>

                {/* ── Image Gallery + Product Info ── */}
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-10 xl:gap-x-16">

                    {/* Left — Image Gallery */}
                    <div className="space-y-4">
                        {/* Main image */}
                        <div className="relative overflow-hidden rounded-3xl aspect-square bg-muted/30 border border-border/40 flex items-center justify-center">
                            {mainImage ? (
                                <img
                                    src={`/storage/${mainImage}`}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-4"
                                />
                            ) : (
                                <Package className="size-24 text-muted-foreground/20" />
                            )}
                            {/* Stock overlay badge */}
                            <div className="absolute top-4 left-4">
                                {product.stock_quantity <= 0 ? (
                                    <Badge className="bg-red-500 text-white font-bold tracking-widest text-[10px] uppercase px-3 py-1 rounded-xl shadow">Out of Stock</Badge>
                                ) : product.stock_quantity <= product.low_stock_threshold ? (
                                    <Badge className="bg-amber-500 text-white font-bold tracking-widest text-[10px] uppercase px-3 py-1 rounded-xl shadow">Low Stock</Badge>
                                ) : null}
                            </div>
                        </div>

                        {/* SKU chip */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                            <Tag className="size-3" />
                            <span className="font-mono">SKU: {product.sku}</span>
                        </div>
                    </div>

                    {/* Right — Product Info */}
                    <div className="mt-10 lg:mt-0 space-y-6">

                        {/* Category badge */}
                        {product.category && (
                            <div className="inline-flex items-center gap-2 rounded-full bg-bm-gold/10 border border-bm-gold/20 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-bm-gold">
                                {product.category.name}
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-3xl font-black tracking-tight lg:text-4xl leading-tight">
                            {product.name}
                        </h1>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="font-mono font-black text-4xl text-bm-gold">
                                ${Number(product.price).toFixed(2)}
                            </span>
                        </div>

                        {/* Placeholder review stars — 4/5 */}
                        <div className="flex items-center gap-3">
                            <StarRating value={4} />
                            <span className="text-sm text-muted-foreground">4.0 out of 5</span>
                        </div>

                        <Separator className="border-border/40" />

                        {/* Stock status */}
                        <StockBadge qty={product.stock_quantity} threshold={product.low_stock_threshold} />

                        {/* Description */}
                        {product.description && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <Info className="size-4 text-muted-foreground" />
                                    Description
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        <Separator className="border-border/40" />

                        {/* Add to Cart button */}
                        <Button
                            onClick={() => { addToCart(product); setCartOpen(true); }}
                            disabled={!inStock}
                            className={cn(
                                'w-full h-14 rounded-2xl font-black text-base uppercase tracking-widest transition-all',
                                inStock
                                    ? cartItem
                                        ? 'bg-foreground text-background hover:bg-foreground/90 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                                        : 'bg-bm-gold hover:bg-bm-gold/90 text-black shadow-[0_20px_40px_-12px_rgba(212,162,0,0.4)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                            )}
                        >
                            <ShoppingCart className="size-5 mr-2" />
                            {!inStock ? 'Unavailable' : cartItem ? `In Cart (${cartItem.quantity}) — Add More` : 'Add to Cart'}
                        </Button>

                        {/* View Cart shortcut — shown when item is in cart */}
                        {cartItem && (
                            <Button
                                variant="outline"
                                onClick={() => setCartOpen(true)}
                                className="w-full h-11 rounded-2xl font-bold border-bm-gold/40 text-bm-gold hover:bg-bm-gold/10 cursor-pointer"
                            >
                                View Cart &amp; Checkout
                                <ChevronRight className="size-4 ml-1" />
                            </Button>
                        )}

                        <div className="text-center text-xs text-muted-foreground/50">
                            Our team will contact you to arrange payment.
                        </div>
                    </div>
                </div>

                {/* ── Related Products ── */}
                {related.length > 0 && (
                    <div className="space-y-5 pt-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black tracking-tight">You Might Also Like</h2>
                            <Link href="/products" className="text-xs font-bold text-bm-gold hover:underline cursor-pointer">
                                Browse All
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {related.map((p) => (
                                <Link
                                    key={p.id}
                                    href={`/products/${p.id}`}
                                    className="group cursor-pointer"
                                >
                                    <Card className="overflow-hidden border border-border/40 bg-background/50 hover:border-bm-gold/40 transition-colors h-full flex flex-col">
                                        <div className="h-40 bg-muted/30 flex items-center justify-center overflow-hidden relative border-b border-border/40">
                                            {p.image_path ? (
                                                <img
                                                    src={`/storage/${p.image_path}`}
                                                    alt={p.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <Package className="size-8 text-muted-foreground/30" />
                                            )}
                                        </div>
                                        <CardContent className="p-3 flex-1 flex flex-col gap-1">
                                            {p.category && (
                                                <p className="text-[10px] font-bold uppercase text-bm-gold">{p.category.name}</p>
                                            )}
                                            <p className="text-xs font-bold line-clamp-2 leading-snug">{p.name}</p>
                                            <p className="mt-auto font-mono font-black text-sm pt-2">
                                                ${Number(p.price).toFixed(2)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
