import { Link } from '@inertiajs/react';
import { Package, ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface RecommendedProduct {
    id: number;
    name: string;
    description: string | null;
    price: string | number;
    image_path: string | null;
    category?: { id: number; name: string } | null;
}

interface Props {
    products: RecommendedProduct[];
}

export function ClientRecommendedProducts({ products }: Props) {
    if (products.length === 0) {
return null;
}

    return (
        <div className="rounded-2xl border border-border/40 bg-background/50 shadow-sm backdrop-blur-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-bm-gold" />
                    <h2 className="text-base font-bold">Recommended Products</h2>
                </div>
                <Link
                    href="/products"
                    className="text-[11px] font-bold text-bm-gold hover:underline cursor-pointer"
                >
                    Browse All
                </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {products.map((p) => (
                    <div
                        key={p.id}
                        className="group rounded-xl border border-border/40 bg-card overflow-hidden hover:border-bm-gold/40 transition-colors flex flex-col"
                    >
                        <div className="h-28 bg-muted/30 flex items-center justify-center overflow-hidden relative border-b border-border/40">
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
                        <div className="p-3 flex-1 flex flex-col gap-1">
                            {p.category && (
                                <p className="text-[10px] font-bold uppercase text-bm-gold">{p.category.name}</p>
                            )}
                            <p className="text-xs font-bold leading-snug line-clamp-2">{p.name}</p>
                            <div className="mt-auto pt-2 flex items-center justify-between">
                                <span className="font-mono font-black text-sm">
                                    ${Number(p.price).toFixed(2)}
                                </span>
                                <Button
                                    size="icon"
                                    className="size-7 bg-bm-gold hover:bg-bm-gold/90 text-black rounded-lg"
                                    asChild
                                >
                                    <Link href="/products" className="cursor-pointer">
                                        <ShoppingCart className="size-3.5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
