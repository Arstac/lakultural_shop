import { getAlbumBySlug, getAlbums, staticAlbums } from "@/lib/products";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/site/ProductDetail";
import { routing } from "@/i18n/routing";

interface ProductPageProps {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
}

export async function generateStaticParams() {
    // Generate all combinations of locale + slug
    const albums = await getAlbums();
    // If no albums in CMS, use static for build not to fail
    const sourceAlbums = albums.length > 0 ? albums : staticAlbums;

    const params: { locale: string; slug: string }[] = [];
    for (const locale of routing.locales) {
        for (const album of sourceAlbums) {
            params.push({ locale, slug: album.slug });
        }
    }
    return params;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    let album = await getAlbumBySlug(slug);

    if (!album) {
        // Fallback to static if not found in CMS (dev mode)
        album = staticAlbums.find(a => a.slug === slug) || null;
    }

    if (!album) {
        notFound();
    }

    if (!album) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-10 md:py-20">
            <ProductDetail album={album} />
        </div>
    );
}
