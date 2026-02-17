import { ProductCard } from "@/components/site/ProductCard";
import { getAlbums, staticAlbums } from "@/lib/products";
import { getTranslations, getLocale } from "next-intl/server";

export default async function CollectionPage() {
    const t = await getTranslations("Products");
    const locale = await getLocale();
    const albums = await getAlbums();
    const displayAlbums = albums.length > 0 ? albums : staticAlbums;

    return (
        <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16))] py-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                        {t("title") || "Our Collection"}
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {t("description") || "Discover the latest sounds."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {displayAlbums.map((album) => (
                        <ProductCard key={album.id} album={album} locale={locale} />
                    ))}
                </div>
            </div>
        </div>
    );
}
