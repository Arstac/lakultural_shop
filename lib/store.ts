import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Album, Track, Event, Merch } from "@/lib/products";

export interface CartItem {
    cartId: string;
    type: 'album_physical' | 'album_digital' | 'track' | 'event' | 'merch';
    album?: Album;
    track?: Track; // Only if type === 'track'
    event?: Event; // Only if type === 'event'
    merch?: Merch; // Only if type === 'merch'
    size?: string; // Only if type === 'merch' and has sizes
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addAlbum: (album: Album, format: 'physical' | 'digital') => void;
    addTrack: (album: Album, track: Track) => void;
    addEvent: (event: Event) => void;
    addMerch: (merch: Merch, size?: string) => void;
    removeItem: (cartId: string) => void;
    updateQuantity: (cartId: string, quantity: number) => void;
    clearCart: () => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

interface PlayerState {
    currentTrack: Track | null;
    currentAlbum: Album | null;
    isPlaying: boolean;
    play: (track: Track, album: Album) => void;
    pause: () => void;
    toggle: () => void;
    nextTrack: () => void;
    prevTrack: () => void;
}

export const useCart = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            setIsOpen: (isOpen) => set({ isOpen }),

            addAlbum: (album, format) => {
                const { items } = get();
                const cartId = `${album.id}-${format}`;
                const existingItem = items.find((item) => item.cartId === cartId);

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item.cartId === cartId
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                        isOpen: true,
                    });
                } else {
                    set({
                        items: [...items, {
                            cartId,
                            type: format === 'physical' ? 'album_physical' : 'album_digital',
                            album,
                            quantity: 1
                        }],
                        isOpen: true,
                    });
                }
            },

            addTrack: (album, track) => {
                const { items } = get();
                const cartId = `${album.id}-${track.id}`;
                const existingItem = items.find((item) => item.cartId === cartId);

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item.cartId === cartId
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                        isOpen: true,
                    });
                } else {
                    set({
                        items: [...items, {
                            cartId,
                            type: 'track',
                            album,
                            track,
                            quantity: 1
                        }],
                        isOpen: true,
                    });
                }
            },

            addEvent: (event) => {
                const { items } = get();
                const cartId = `event-${event.id}`;
                const existingItem = items.find((item) => item.cartId === cartId);

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item.cartId === cartId
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                        isOpen: true,
                    });
                } else {
                    set({
                        items: [...items, {
                            cartId,
                            type: 'event',
                            event,
                            quantity: 1
                        }],
                        isOpen: true,
                    });
                }
            },

            addMerch: (merch, size) => {
                const { items } = get();
                const cartId = `merch-${merch.id}-${size || 'default'}`;
                const existingItem = items.find((item) => item.cartId === cartId);

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item.cartId === cartId
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                        isOpen: true,
                    });
                } else {
                    set({
                        items: [...items, {
                            cartId,
                            type: 'merch',
                            merch,
                            size,
                            quantity: 1
                        }],
                        isOpen: true,
                    });
                }
            },

            removeItem: (cartId) => {
                set({ items: get().items.filter((item) => item.cartId !== cartId) });
            },

            updateQuantity: (cartId, quantity) => {
                if (quantity < 1) return;
                set({
                    items: get().items.map((item) =>
                        item.cartId === cartId ? { ...item, quantity } : item
                    )
                });
            },

            clearCart: () => set({ items: [] }),
        }),
        {
            name: "kroma-cart",
            partialize: (state) => ({ items: state.items }),
        }
    )
);

export const usePlayer = create<PlayerState>((set, get) => ({
    currentTrack: null,
    currentAlbum: null,
    isPlaying: false,
    play: (track, album) => set({ currentTrack: track, currentAlbum: album, isPlaying: true }),
    pause: () => set({ isPlaying: false }),
    toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
    nextTrack: () => {
        const { currentTrack, currentAlbum } = get();
        if (!currentTrack || !currentAlbum) return;
        const currentIndex = currentAlbum.tracks.findIndex(t => t.id === currentTrack.id);
        if (currentIndex < currentAlbum.tracks.length - 1) {
            set({ currentTrack: currentAlbum.tracks[currentIndex + 1], isPlaying: true });
        }
    },
    prevTrack: () => {
        const { currentTrack, currentAlbum } = get();
        if (!currentTrack || !currentAlbum) return;
        const currentIndex = currentAlbum.tracks.findIndex(t => t.id === currentTrack.id);
        if (currentIndex > 0) {
            set({ currentTrack: currentAlbum.tracks[currentIndex - 1], isPlaying: true });
        }
    }
}));
