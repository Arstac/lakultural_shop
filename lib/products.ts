import { client, urlFor } from "./sanity.client";
import { groq } from "next-sanity";

export interface Track {
    id: string; // Sanity _key or _id
    title: string;
    duration: string;
    previewUrl: string; // URL to audio file
    price: number;
}

export interface Album {
    id: string; // Sanity _id
    title: string;
    artist: string;
    slug: string;
    description: string;
    coverImage: string;
    physicalPrice: number;
    digitalPrice: number;
    tracks: Track[];
    releaseDate?: string;
    genre?: string;
}

export interface Merch {
    id: string; // Sanity _id
    title: string;
    slug: string;
    price: number;
    images: string[];
    description: string;
    sizes: string[];
    stock: number;
}

// GROQ Queries
const albumsQuery = groq`*[_type == "album"] {
    _id,
    title,
    artist,
    "slug": slug.current,
    description,
    coverImage,
    physicalPrice,
    digitalPrice,
    genre,
    releaseDate,
    tracks[] {
        _key,
        title,
        duration,
        price,
        "previewUrl": previewAudio.asset->url
    }
}`;

const albumBySlugQuery = groq`*[_type == "album" && slug.current == $slug][0] {
    _id,
    title,
    artist,
    "slug": slug.current,
    description,
    coverImage,
    physicalPrice,
    digitalPrice,
    genre,
    releaseDate,
    tracks[] {
        _key,
        title,
        duration,
        price,
        "previewUrl": previewAudio.asset->url
    }
}`;

// Helper to map Sanity result to Album interface
const mapSanityAlbum = (sanityAlbum: any): Album => ({
    id: sanityAlbum._id,
    title: sanityAlbum.title,
    artist: sanityAlbum.artist,
    slug: sanityAlbum.slug,
    description: sanityAlbum.description,
    coverImage: sanityAlbum.coverImage ? urlFor(sanityAlbum.coverImage).url() : "/placeholder-album-1.jpg",
    physicalPrice: sanityAlbum.physicalPrice,
    digitalPrice: sanityAlbum.digitalPrice,
    genre: sanityAlbum.genre,
    releaseDate: sanityAlbum.releaseDate,
    tracks: sanityAlbum.tracks?.map((t: any) => ({
        id: t._key,
        title: t.title,
        duration: t.duration,
        price: t.price,
        previewUrl: t.previewUrl || ""
    })) || []
});

export const getAlbums = async (): Promise<Album[]> => {
    try {
        const data = await client.fetch(albumsQuery);
        return data.map(mapSanityAlbum);
    } catch (error) {
        console.error("Error fetching albums:", error);
        return [];
    }
};

export const getAlbumBySlug = async (slug: string): Promise<Album | null> => {
    try {
        const data = await client.fetch(albumBySlugQuery, { slug });
        if (!data) return null;
        return mapSanityAlbum(data);
    } catch (error) {
        console.error(`Error fetching album ${slug}:`, error);
        return null;
    }
};

// Home Page Content Interface
export interface HomePageContent {
    headline: string;
    subheadline: string;
    description: string;
    heroImage: string;
    titleImage?: string; // New field for title image
    ctaText: string;
}

// Fetch function
export const getHomePageContent = async (): Promise<HomePageContent | null> => {
    try {
        const query = groq`*[_type == "homePage"][0] {
            headline,
            subheadline,
            description,
            ctaText,
            heroImage,
            titleImage
        }`;
        const data = await client.fetch(query);
        if (!data) return null;

        return {
            headline: data.headline,
            subheadline: data.subheadline,
            description: data.description,
            ctaText: data.ctaText || "Explorar Catálogo",
            heroImage: data.heroImage ? urlFor(data.heroImage).url() : "/background_kultural.jpeg",
            titleImage: data.titleImage ? urlFor(data.titleImage).url() : "/kultural.svg"
        };
    } catch (error) {
        console.error("Error fetching home page content:", error);
        return null;
    }
};

export const staticAlbums: Album[] = [
    {
        id: "album-1",
        title: "Neon Nights",
        artist: "La Kultural",
        slug: "neon-nights",
        description: "A synth-wave journey through the midnight city streets.",
        coverImage: "/placeholder-album-1.jpg",
        physicalPrice: 25,
        digitalPrice: 12,
        genre: "Synthwave",
        tracks: [
            { id: "t1-1", title: "Midnight Drive", duration: "3:45", price: 1.50, previewUrl: "/audio/placeholder.mp3" },
            { id: "t1-2", title: "Neon Lights", duration: "4:20", price: 1.50, previewUrl: "/audio/placeholder.mp3" },
        ]
    }
];

export interface PricingTier {
    name: string;
    price: number;
    startDate?: string;
    endDate?: string;
    ticketLimit?: number;
}

export interface Event {
    id: string;
    title: string;
    slug: string;
    date: string;
    location: string;
    price: number;
    pricingTiers?: PricingTier[];
    image: string;
    description: string;
    mapUrl?: string;
    organizer?: {
        name: string;
        email: string;
        phone: string;
        image: string;
    };
}

/**
 * Evaluates pricing tiers in order and returns the first active one.
 * A tier is active if ALL its defined conditions are met:
 *  - startDate: now >= startDate
 *  - endDate: now < endDate
 *  - ticketLimit: soldCount < ticketLimit
 * Returns null if no tier is active (fallback to event.price).
 */
export function getActiveTier(tiers: PricingTier[] | undefined, soldCount: number): PricingTier | null {
    if (!tiers || tiers.length === 0) return null;
    const now = new Date();
    for (const tier of tiers) {
        let matches = true;
        if (tier.startDate && now < new Date(tier.startDate)) matches = false;
        if (tier.endDate && now >= new Date(tier.endDate)) matches = false;
        if (tier.ticketLimit !== undefined && soldCount >= tier.ticketLimit) matches = false;
        if (matches) return tier;
    }
    return null;
}

const eventsQuery = groq`*[_type == "event"] {
    _id,
    title,
    "slug": slug.current,
    date,
    location,
    price,
    image,
    description,
    pricingTiers[] {
        _key,
        name,
        price,
        startDate,
        endDate,
        ticketLimit
    },
    mapUrl,
    organizer {
        name,
        email,
        phone,
        "image": image.asset->url
    }
} | order(date asc)`;

const merchQuery = groq`*[_type == "merch"] {
    _id,
    title,
    "slug": slug.current,
    price,
    images,
    description,
    sizes,
    stock
}`;

const merchBySlugQuery = groq`*[_type == "merch" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    price,
    images,
    description,
    sizes,
    stock
}`;

const eventBySlugQuery = groq`*[_type == "event" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    date,
    location,
    price,
    image,
    description,
    pricingTiers[] {
        _key,
        name,
        price,
        startDate,
        endDate,
        ticketLimit
    },
    mapUrl,
    organizer {
        name,
        email,
        phone,
        "image": image.asset->url
    }
}`;

const mapSanityEvent = (sanityEvent: any): Event => ({
    id: sanityEvent._id,
    title: sanityEvent.title,
    slug: sanityEvent.slug,
    date: sanityEvent.date,
    location: sanityEvent.location,
    price: sanityEvent.price,
    pricingTiers: sanityEvent.pricingTiers?.map((t: any) => ({
        name: t.name,
        price: t.price,
        startDate: t.startDate,
        endDate: t.endDate,
        ticketLimit: t.ticketLimit,
    })) || [],
    image: sanityEvent.image ? urlFor(sanityEvent.image).url() : "/placeholder-event.jpg",
    description: sanityEvent.description,
    mapUrl: sanityEvent.mapUrl,
    organizer: sanityEvent.organizer ? {
        name: sanityEvent.organizer.name,
        email: sanityEvent.organizer.email,
        phone: sanityEvent.organizer.phone,
        image: sanityEvent.organizer.image || "/placeholder-avatar.jpg"
    } : undefined
});

export const getEvents = async (): Promise<Event[]> => {
    try {
        const data = await client.fetch(eventsQuery);
        return data.map(mapSanityEvent);
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
};

export const getEventBySlug = async (slug: string): Promise<Event | null> => {
    try {
        const data = await client.fetch(eventBySlugQuery, { slug });
        if (!data) return null;
        return mapSanityEvent(data);
    } catch (error) {
        console.error(`Error fetching event ${slug}:`, error);
        return null;
    }
};
export const getMerch = async (): Promise<Merch[]> => {
    try {
        const data = await client.fetch(merchQuery);
        return data.map((merch: any) => ({
            id: merch._id,
            title: merch.title,
            slug: merch.slug,
            price: merch.price,
            images: merch.images ? merch.images.map((img: any) => urlFor(img).url()) : [],
            description: merch.description,
            sizes: merch.sizes || [],
            stock: merch.stock || 0
        }));
    } catch (error) {
        console.error('Error fetching merch:', error);
        return [];
    }
};

export const getMerchBySlug = async (slug: string): Promise<Merch | null> => {
    try {
        const data = await client.fetch(merchBySlugQuery, { slug });
        if (!data) return null;
        return {
            id: data._id,
            title: data.title,
            slug: data.slug,
            price: data.price,
            images: data.images ? data.images.map((img: any) => urlFor(img).url()) : [],
            description: data.description,
            sizes: data.sizes || [],
            stock: data.stock || 0
        };
    } catch (error) {
        console.error(`Error fetching merch ${slug}:`, error);
        return null;
    }
};
