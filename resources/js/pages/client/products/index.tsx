import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Filter, ShoppingBag, Package, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import Swal from 'sweetalert2';

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

    const handleSearch = () => {
        router.get('/products', { ...filters, search: search || undefined, page: 1 }, { preserveState: true });
    };

    const handleCategory = (val: string) => {
        router.get('/products', { ...filters, category: val, page: 1 }, { preserveState: true });
    };

    const handleOrder = (product: Product) => {
        Swal.fire({
            title: 'Quick Order',
            text: `Place an order for "${product.name}" for $${Number(product.price).toFixed(2)}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#eab308',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Order Now!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/products/${product.id}/purchase`, {}, {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Order Placed!',
                            text: 'Your order has been received. Our team will contact you soon.',
                            icon: 'success',
                            confirmButtonColor: '#eab308',
                        });
                    }
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Shop', href: '#' }]}>
            <Head title="Shop Products" />
            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                <Heading title="Shop" description="Browse our parts, upgrades, and merchandise." />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input placeholder="Search products..." className="pl-9 rounded-xl border-border/40" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                    </div>
                    <Select value={filters.category} onValueChange={handleCategory}>
                        <SelectTrigger className="w-[180px] rounded-xl border-border/40"><Filter className="size-4 mr-2 text-muted-foreground" /><SelectValue placeholder="All Categories" /></SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all" className="rounded-xl">All Categories</SelectItem>
                            {categories.map(c => <SelectItem key={c.id} value={String(c.id)} className="rounded-xl">{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {products.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 mt-4 space-y-4 rounded-2xl border border-dashed border-border/60 bg-muted/20">
                        <ShoppingBag className="size-10 text-muted-foreground" />
                        <p className="text-muted-foreground text-sm">No products found matching your criteria.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.data.map(p => (
                                <Card key={p.id} className="overflow-hidden border-border/40 bg-background/50 hover:border-bm-gold/50 transition-colors group flex flex-col">
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
                                    <CardContent className="p-4 flex flex-col flex-1">
                                        <div className="text-xs font-semibold uppercase text-bm-gold mb-1">{p.category?.name || 'Uncategorized'}</div>
                                        <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">{p.name}</h3>
                                        <div className="mt-auto pt-4 flex items-center justify-between">
                                            <div className="font-mono font-black text-xl">${Number(p.price).toFixed(2)}</div>
                                            {p.stock_quantity > 0 ? (
                                                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md flex items-center gap-1"><CheckCircle2 className="size-3" /> In Stock</span>
                                            ) : (
                                                <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-md flex items-center gap-1"><AlertCircle className="size-3" /> Unavailable</span>
                                            )}
                                        </div>
                                        {p.stock_quantity > 0 && (
                                            <Button
                                                onClick={() => handleOrder(p)}
                                                className="w-full mt-4 bg-bm-gold hover:bg-bm-gold/90 text-black font-black uppercase tracking-widest rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                <ShoppingCart className="size-4 mr-2" /> Order Now
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <Pagination links={products.links} className="mt-8" />
                    </>
                )}
            </div>
        </AppLayout>
    );
}
