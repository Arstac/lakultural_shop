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
            heroImage
        }`;
        const data = await client.fetch(query);
        if (!data) return null;

        return {
            headline: data.headline,
            subheadline: data.subheadline,
            description: data.description,
            ctaText: data.ctaText || "Explorar Catálogo",
            heroImage: data.heroImage ? urlFor(data.heroImage).url() : "/hero_music.jpg"
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
