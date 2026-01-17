import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, Variant } from "@/lib/products";

export interface CartItem {
    id: string; // Unique ID (product.id + variant.id)
    product: Product;
    variant: Variant;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (product: Product, variant: Variant) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const useCart = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            setIsOpen: (isOpen) => set({ isOpen }),

            addItem: (product, variant) => {
                const { items } = get();
                const itemId = `${product.id}-${variant.id}`;
                const existingItem = items.find((item) => item.id === itemId);

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item.id === itemId
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                        isOpen: true,
                    });
                } else {
                    set({
                        items: [...items, { id: itemId, product, variant, quantity: 1 }],
                        isOpen: true,
                    });
                }
            },

            removeItem: (itemId) => {
                set({ items: get().items.filter((item) => item.id !== itemId) });
            },

            updateQuantity: (itemId, quantity) => {
                if (quantity < 1) return;
                set({
                    items: get().items.map((item) =>
                        item.id === itemId ? { ...item, quantity } : item
                    )
                });
            },

            clearCart: () => set({ items: [] }),
        }),
        {
            name: "kroma-cart",
            partialize: (state) => ({ items: state.items }), // Only persist items
        }
    )
);
