import { router } from '@inertiajs/react';
import {
    ShoppingCart, X, Package, Plus, Minus,
    Trash2, ShoppingBag, ChevronRight,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
} from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { type CartItem } from '@/hooks/use-cart';

interface Props {
    open: boolean;
    onClose: () => void;
    cart: CartItem[];
    cartCount: number;
    subtotal: number;
    tax: number;
    total: number;
    updateQty: (productId: number, delta: number) => void;
    removeFromCart: (productId: number) => void;
    clearCart: () => void;
}

export function CartDrawer({
    open, onClose, cart, cartCount, subtotal, tax, total,
    updateQty, removeFromCart, clearCart,
}: Props) {
    const handleCheckout = () => {
        if (cart.length === 0) return;
        Swal.fire({
            title: 'Place Order?',
            html: `<strong>${cartCount} item${cartCount > 1 ? 's' : ''}</strong> &mdash; Total: <strong>$${total.toFixed(2)}</strong><br/><small class="text-gray-400">Our team will contact you for payment.</small>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d4a200',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Place Order',
        }).then(result => {
            if (!result.isConfirmed) return;
            router.post('/products/cart/checkout', {
                items: cart.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
            }, {
                onSuccess: () => { clearCart(); onClose(); },
            });
        });
    };

    return (
        <Drawer
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    onClose();
                }
            }}
            direction="right"
        >
            <DrawerContent className="h-full w-full p-0 sm:max-w-sm">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/40 p-5">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="size-5 text-bm-gold" />
                        <h2 className="text-lg font-black">Order Summary</h2>
                        {cartCount > 0 && (
                            <Badge className="rounded-full bg-bm-gold px-2 text-xs font-black text-black">
                                {cartCount}
                            </Badge>
                        )}
                    </div>

                    <DrawerClose asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer rounded-xl hover:bg-muted/60"
                        >
                            <X className="size-5" />
                        </Button>
                    </DrawerClose>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-center pb-10">
                            <div className="size-16 rounded-2xl bg-muted/30 flex items-center justify-center">
                                <ShoppingBag className="size-8 text-muted-foreground/40" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Your cart is empty</p>
                                <p className="text-xs text-muted-foreground mt-1">Add products from the shop to get started.</p>
                            </div>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.product.id} className="flex items-start gap-3 p-3 rounded-2xl border border-border/40 bg-muted/10">
                                {/* Thumbnail */}
                                <div className="size-14 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center overflow-hidden shrink-0">
                                    {item.product.image_path ? (
                                        <img src={`/storage/${item.product.image_path}`} alt={item.product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="size-6 text-muted-foreground/30" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <p className="text-sm font-bold leading-snug line-clamp-2">{item.product.name}</p>
                                    {item.product.category && (
                                        <p className="text-[10px] uppercase font-bold text-bm-gold">{item.product.category.name}</p>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center rounded-xl border border-border/40 bg-background overflow-hidden">
                                            <button onClick={() => updateQty(item.product.id, -1)} className="px-2 py-1 hover:bg-muted/50 transition-colors cursor-pointer">
                                                <Minus className="size-3.5" />
                                            </button>
                                            <span className="px-3 py-1 text-sm font-mono font-bold min-w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQty(item.product.id, 1)}
                                                disabled={item.quantity >= item.product.stock_quantity}
                                                className="px-2 py-1 hover:bg-muted/50 transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                                            >
                                                <Plus className="size-3.5" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-black text-sm">
                                                ${(Number(item.product.price) * item.quantity).toFixed(2)}
                                            </span>
                                            <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground/50 hover:text-red-500 transition-colors cursor-pointer">
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="border-t border-border/40 p-5 space-y-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span><span className="font-mono">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Tax (10%)</span><span className="font-mono">${tax.toFixed(2)}</span>
                            </div>
                            <Separator className="my-1 border-border/40" />
                            <div className="flex justify-between font-black text-base">
                                <span>Total</span>
                                <span className="font-mono text-bm-gold">${total.toFixed(2)}</span>
                            </div>
                        </div>
                        <Button
                            onClick={handleCheckout}
                            className="w-full h-12 bg-bm-gold hover:bg-bm-gold/90 text-black font-black uppercase tracking-widest rounded-2xl shadow-[0_20px_40px_-12px_rgba(212,162,0,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                            Place Order · ${total.toFixed(2)}
                            <ChevronRight className="size-4 ml-1" />
                        </Button>
                        <button onClick={clearCart} className="w-full text-xs text-muted-foreground/50 hover:text-red-400 transition-colors text-center cursor-pointer">
                            Clear cart
                        </button>
                    </div>
                )}
            </DrawerContent>
        </Drawer>
    );
}

/** Floating cart toggle button — use in page headers */
export function CartButton({ cartCount, onClick }: { cartCount: number; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="relative bg-bm-dark flex items-center gap-2 rounded-2xl border border-border/40 px-4 py-2.5 font-bold text-sm hover:border-bm-gold/40 transition-colors cursor-pointer"
        >
            <ShoppingCart className="size-4 text-bm-gold" />
            <span>Cart</span>
            {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 size-5 rounded-full bg-bm-gold text-black text-[10px] font-black flex items-center justify-center">
                    {cartCount}
                </span>
            )}
        </button>
    );
}
