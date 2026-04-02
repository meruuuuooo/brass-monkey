import { Head, router, Link } from '@inertiajs/react';
import {
    Search, Filter, ShoppingBag, Package,
    CheckCircle2, AlertCircle, ShoppingCart,
} from 'lucide-react';
import { useState } from 'react';
import { CartDrawer, CartButton } from '@/components/cart-drawer';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useCart } from '@/hooks/use-cart';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

interface Product {
    id: number; name: string; sku: string; description: string; price: number;
    stock_quantity: number; low_stock_threshold: number; image_path: string | null;
    category: { id: number; name: string } | null;
}

interface Props {
    products: { data: Product[]; links: any[]; current_page: number; last_page: number };
    categories: { id: number; name: string }[];
    filters: { search: string; category: string };
}

export default function ClientProductsIndex({ products, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [cartOpen, setCartOpen] = useState(false);
    const { cart, cartCount, subtotal, tax, total, addToCart, updateQty, removeFromCart, clearCart, inCart } = useCart();

    const handleSearch = () => {
        router.get('/products', { ...filters, search: search || undefined, page: 1 }, { preserveState: true });
    };

    const handleCategory = (val: string) => {
        router.get('/products', { ...filters, category: val, page: 1 }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Shop', href: '#' }]}>
            <Head title="Shop Products" />

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

            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                <div className="flex items-start justify-between">
                    <Heading title="Shop" description="Browse our parts, upgrades, and merchandise." />
                    <CartButton cartCount={cartCount} onClick={() => setCartOpen(true)} />
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            className="pl-9 rounded-xl border-border/40"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Select value={filters.category} onValueChange={handleCategory}>
                        <SelectTrigger className="w-[180px] rounded-xl border-border/40">
                            <Filter className="size-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all" className="rounded-xl">All Categories</SelectItem>
                            {categories.map(c => (
                                <SelectItem key={c.id} value={String(c.id)} className="rounded-xl">{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Grid */}
                {products.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 mt-4 space-y-4 rounded-2xl border border-dashed border-border/60 bg-muted/20">
                        <ShoppingBag className="size-10 text-muted-foreground" />
                        <p className="text-muted-foreground text-sm">No products found matching your criteria.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.data.map(p => {
                                const cartItem = inCart(p.id);
                                return (
                                    <Card key={p.id} className="overflow-hidden border-border/40 bg-background/50 hover:border-bm-gold/50 transition-colors group flex flex-col">
                                        <Link href={`/products/${p.id}`} className="block cursor-pointer">
                                            <div className="h-48 w-full bg-muted/30 relative flex items-center justify-center overflow-hidden border-b border-border/40">
                                                {p.image_path ? (
                                                    <img src={`/storage/${p.image_path}`} alt={p.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <Package className="size-10 text-muted-foreground/30" />
                                                )}
                                                {p.stock_quantity <= 0 ? (
                                                    <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white font-bold tracking-wider px-2 py-0.5 shadow-sm">OUT OF STOCK</Badge>
                                                ) : p.stock_quantity <= p.low_stock_threshold ? (
                                                    <Badge className="absolute top-3 right-3 bg-amber-500 hover:bg-amber-600 text-white font-bold tracking-wider px-2 py-0.5 shadow-sm">LOW STOCK</Badge>
                                                ) : null}
                                            </div>
                                        </Link>
                                        <CardContent className="p-4 flex flex-col flex-1">
                                            <div className="text-xs font-semibold uppercase text-bm-gold mb-1">{p.category?.name || 'Uncategorized'}</div>
                                            <Link href={`/products/${p.id}`} className="cursor-pointer">
                                                <h3 className="font-bold text-base leading-tight mb-2 line-clamp-2 hover:text-bm-gold transition-colors">{p.name}</h3>
                                            </Link>
                                            <div className="mt-auto pt-3 flex items-center justify-between">
                                                <div className="font-mono font-black text-xl">${Number(p.price).toFixed(2)}</div>
                                                {p.stock_quantity > 0 ? (
                                                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md flex items-center gap-1">
                                                        <CheckCircle2 className="size-3" /> In Stock
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-md flex items-center gap-1">
                                                        <AlertCircle className="size-3" /> Unavailable
                                                    </span>
                                                )}
                                            </div>
                                            {p.stock_quantity > 0 && (
                                                <Button
                                                    onClick={() => { addToCart(p); setCartOpen(true); }}
                                                    className={cn(
                                                        'w-full mt-3 font-black uppercase tracking-widest rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer',
                                                        cartItem
                                                            ? 'bg-foreground text-background hover:bg-foreground/90'
                                                            : 'bg-bm-gold hover:bg-bm-gold/90 text-black'
                                                    )}
                                                >
                                                    <ShoppingCart className="size-4 mr-2" />
                                                    {cartItem ? `In Cart (${cartItem.quantity})` : 'Add to Cart'}
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                        <Pagination links={products.links} className="mt-8" />
                    </>
                )}
            </div>
        </AppLayout>
    );
}
