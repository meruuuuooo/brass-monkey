import { useState, useEffect, useCallback } from 'react';

export interface CartProduct {
    id: number;
    name: string;
    price: number | string;
    image_path: string | null;
    stock_quantity: number;
    category: { id: number; name: string } | null;
}

export interface CartItem {
    product: CartProduct;
    quantity: number;
}

const STORAGE_KEY = 'bm_cart';
const CART_UPDATED_EVENT = 'bm:cart-updated';

function readStorage(): CartItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeStorage(items: CartItem[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
}

export function useCart() {
    const [cart, setCartState] = useState<CartItem[]>(() => readStorage());

    // Keep all useCart consumers in sync within the same tab and across tabs.
    useEffect(() => {
        const onCartUpdated = (event: Event) => {
            const customEvent = event as CustomEvent<CartItem[] | undefined>;

            if (Array.isArray(customEvent.detail)) {
                setCartState(customEvent.detail);
                return;
            }

            setCartState(readStorage());
        };

        const onStorage = (event: StorageEvent) => {
            if (event.key === STORAGE_KEY) {
                setCartState(readStorage());
            }
        };

        window.addEventListener(CART_UPDATED_EVENT, onCartUpdated as EventListener);
        window.addEventListener('storage', onStorage);

        return () => {
            window.removeEventListener(CART_UPDATED_EVENT, onCartUpdated as EventListener);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    const setCart = useCallback(
        (updater: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
            setCartState((prev) => {
                const next =
                    typeof updater === 'function' ? updater(prev) : updater;

                writeStorage(next);
                window.dispatchEvent(
                    new CustomEvent<CartItem[]>(CART_UPDATED_EVENT, {
                        detail: next,
                    }),
                );

                return next;
            });
        },
        [],
    );

    const addToCart = useCallback(
        (product: CartProduct) => {
            setCart((prev) => {
                const existing = prev.find((i) => i.product.id === product.id);
                if (existing) {
                    return prev.map((i) =>
                        i.product.id === product.id
                            ? {
                                  ...i,
                                  quantity: Math.min(
                                      i.quantity + 1,
                                      product.stock_quantity,
                                  ),
                              }
                            : i,
                    );
                }
                return [...prev, { product, quantity: 1 }];
            });
        },
        [setCart],
    );

    const updateQty = useCallback(
        (productId: number, delta: number) => {
            setCart((prev) =>
                prev
                    .map((i) =>
                        i.product.id === productId
                            ? { ...i, quantity: i.quantity + delta }
                            : i,
                    )
                    .filter((i) => i.quantity > 0),
            );
        },
        [setCart],
    );

    const removeFromCart = useCallback(
        (productId: number) => {
            setCart((prev) => prev.filter((i) => i.product.id !== productId));
        },
        [setCart],
    );

    const clearCart = useCallback(() => setCart([]), [setCart]);

    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
    const subtotal = cart.reduce(
        (s, i) => s + Number(i.product.price) * i.quantity,
        0,
    );
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const inCart = useCallback(
        (productId: number) => cart.find((i) => i.product.id === productId),
        [cart],
    );

    return {
        cart,
        cartCount,
        subtotal,
        tax,
        total,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        inCart,
    };
}
